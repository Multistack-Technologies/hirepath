# analytics/analytics_engine.py
from django.db.models import Count, Q, Avg, Min, Max
from django.utils import timezone
from datetime import timedelta, datetime
from collections import defaultdict
import pandas as pd
from applications.models import Application
from jobs.models import Job

class RecruitmentAnalyticsEngine:
    def __init__(self, recruiter):
        self.recruiter = recruiter
        self.recruiter_jobs = Job.objects.filter(created_by=recruiter)
        self.applications = Application.objects.filter(job__in=self.recruiter_jobs)
    
    def get_recruiter_overview(self, days=30):
        """Get overview statistics for recruiter dashboard"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        recent_applications = self.applications.filter(
            applied_at__date__range=[start_date, end_date]
        )
        
        return {
            'period': f"Last {days} days",
            'total_jobs': self.recruiter_jobs.count(),
            'active_jobs': self.recruiter_jobs.filter(
                Q(closing_date__gte=end_date) | Q(closing_date__isnull=True)
            ).count(),
            'total_applications': recent_applications.count(),
            'applications_trend': self._get_applications_trend(days),
            'conversion_rate': self._calculate_conversion_rate(recent_applications),
            'average_match_score': recent_applications.aggregate(avg=Avg('match_score'))['avg'] or 0,
            'top_performing_jobs': self._get_top_performing_jobs(days),
            'quick_stats': self._get_quick_stats(recent_applications)
        }
    
    def get_applications_analysis(self, start_date, end_date, filters=None):
        """Detailed applications analysis"""
        applications = self._apply_filters(
            self.applications.filter(applied_at__date__range=[start_date, end_date]),
            filters
        )
        
        return {
            'summary': {
                'total_applications': applications.count(),
                'applications_by_status': dict(applications.values('status').annotate(count=Count('id'))),
                'applications_by_source': dict(applications.values('application_source').annotate(count=Count('id'))),
                'average_match_score': applications.aggregate(avg=Avg('match_score'))['avg'] or 0,
            },
            'trends': {
                'daily_applications': self._get_daily_trends(applications, start_date, end_date),
                'status_changes': self._get_status_change_trends(start_date, end_date),
            },
            'quality_metrics': {
                'high_quality': applications.filter(match_score__gte=80).count(),
                'medium_quality': applications.filter(match_score__gte=60, match_score__lt=80).count(),
                'low_quality': applications.filter(match_score__lt=60).count(),
            },
            'detailed_breakdown': list(
                applications.values('job__title').annotate(
                    total=Count('id'),
                    avg_match=Avg('match_score'),
                    hired=Count('id', filter=Q(status='ACCEPTED'))
                ).order_by('-total')
            )
        }
    
    def get_candidate_pipeline(self, start_date, end_date):
        """Candidate pipeline analysis"""
        applications = self.applications.filter(applied_at__date__range=[start_date, end_date])
        
        pipeline_data = applications.values('status').annotate(
            count=Count('id'),
            avg_days_in_stage=Avg('match_score'),  # Simplified - would need stage timestamps
            min_match=Min('match_score'),
            max_match=Max('match_score')
        ).order_by('status')
        
        # Calculate conversion rates
        stages = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED']
        conversion_rates = {}
        
        for i in range(len(stages) - 1):
            current_stage = applications.filter(status=stages[i]).count()
            next_stage = applications.filter(status=stages[i + 1]).count()
            rate = (next_stage / current_stage * 100) if current_stage > 0 else 0
            conversion_rates[f'{stages[i]}_to_{stages[i + 1]}'] = round(rate, 2)
        
        return {
            'pipeline_stages': list(pipeline_data),
            'conversion_rates': conversion_rates,
            'bottlenecks': self._identify_bottlenecks(applications),
            'pipeline_health': self._assess_pipeline_health(applications)
        }
    
    def get_source_analysis(self, start_date, end_date):
        """Application source performance analysis"""
        applications = self.applications.filter(applied_at__date__range=[start_date, end_date])
        
        source_data = applications.values('application_source').annotate(
            total_applications=Count('id'),
            avg_match_score=Avg('match_score'),
            conversion_rate=Count('id', filter=Q(status='ACCEPTED')) * 100.0 / Count('id'),
            cost_per_application=Avg('match_score')  # Placeholder - would integrate with actual cost data
        ).order_by('-total_applications')
        
        return {
            'source_performance': list(source_data),
            'source_trends': self._get_source_trends(start_date, end_date),
            'recommendations': self._generate_source_recommendations(source_data)
        }
    
    def get_skill_gap_analysis(self, start_date, end_date):
        """Analyze skill gaps across applications"""
        applications = self.applications.filter(
            applied_at__date__range=[start_date, end_date]
        ).select_related('applicant', 'job').prefetch_related(
            'job__skills_required', 'applicant__skills'
        )
        
        skill_gaps = []
        skill_frequency = defaultdict(int)
        
        for app in applications:
            job_skills = set(app.job.skills_required.values_list('name', flat=True))
            applicant_skills = set(app.applicant.skills.values_list('name', flat=True))
            missing_skills = job_skills - applicant_skills
            
            for skill in missing_skills:
                skill_frequency[skill] += 1
            
            if missing_skills:
                skill_gaps.append({
                    'application_id': app.id,
                    'job_title': app.job.title,
                    'applicant_name': app.applicant.get_full_name(),
                    'match_score': app.match_score,
                    'missing_skills_count': len(missing_skills),
                    'critical_missing_skills': list(missing_skills)[:3]  # Top 3 missing skills
                })
        
        return {
            'summary': {
                'total_applications_with_gaps': len(skill_gaps),
                'most_missing_skills': dict(sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)[:10]),
                'average_skills_missing': sum(gap['missing_skills_count'] for gap in skill_gaps) / len(skill_gaps) if skill_gaps else 0,
            },
            'detailed_analysis': skill_gaps[:50],  # Limit for performance
            'recommendations': self._generate_skill_gap_recommendations(skill_frequency)
        }
    
    def get_time_to_hire_analysis(self, start_date, end_date):
        """Time to hire metrics analysis"""
        hired_applications = self.applications.filter(
            status='ACCEPTED',
            updated_at__date__range=[start_date, end_date]
        )
        
        time_metrics = []
        for app in hired_applications:
            days_to_hire = (app.updated_at.date() - app.applied_at.date()).days
            time_metrics.append({
                'job_title': app.job.title,
                'applicant_name': app.applicant.get_full_name(),
                'days_to_hire': days_to_hire,
                'applied_date': app.applied_at.date(),
                'hired_date': app.updated_at.date(),
                'match_score': app.match_score
            })
        
        if time_metrics:
            avg_time = sum(metric['days_to_hire'] for metric in time_metrics) / len(time_metrics)
            fastest = min(time_metrics, key=lambda x: x['days_to_hire'])
            slowest = max(time_metrics, key=lambda x: x['days_to_hire'])
        else:
            avg_time = 0
            fastest = slowest = None
        
        return {
            'time_metrics': {
                'average_time_to_hire': round(avg_time, 1),
                'fastest_hire': fastest,
                'slowest_hire': slowest,
                'hire_distribution': self._get_hire_time_distribution(time_metrics)
            },
            'factors_analysis': self._analyze_hire_time_factors(time_metrics),
            'improvement_opportunities': self._identify_hire_time_improvements(time_metrics)
        }
    
    # Helper methods
    def _apply_filters(self, queryset, filters):
        """Apply filters to queryset"""
        if not filters:
            return queryset
        
        if filters.get('status'):
            queryset = queryset.filter(status=filters['status'])
        if filters.get('min_match_score'):
            queryset = queryset.filter(match_score__gte=filters['min_match_score'])
        if filters.get('job_id'):
            queryset = queryset.filter(job_id=filters['job_id'])
        if filters.get('source'):
            queryset = queryset.filter(application_source=filters['source'])
            
        return queryset
    
    def _get_applications_trend(self, days):
        """Get applications trend over time"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        trends = self.applications.filter(
            applied_at__date__range=[start_date, end_date]
        ).extra({
            'date': "DATE(applied_at)"
        }).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        return list(trends)
    
    def _calculate_conversion_rate(self, applications):
        """Calculate overall conversion rate"""
        total = applications.count()
        hired = applications.filter(status='ACCEPTED').count()
        return (hired / total * 100) if total > 0 else 0
    
    def _get_top_performing_jobs(self, days):
        """Get top performing jobs by applications and conversions"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        return list(
            self.recruiter_jobs.filter(
                applications__applied_at__date__range=[start_date, end_date]
            ).annotate(
                application_count=Count('applications'),
                hire_count=Count('applications', filter=Q(applications__status='ACCEPTED')),
                avg_match=Avg('applications__match_score')
            ).order_by('-application_count')[:5]
        )
    
    def _get_quick_stats(self, applications):
        """Generate quick stats for dashboard"""
        return {
            'applications_today': applications.filter(
                applied_at__date=timezone.now().date()
            ).count(),
            'pending_review': applications.filter(status='PENDING').count(),
            'interviews_scheduled': applications.filter(status='INTERVIEW').count(),
            'new_hires': applications.filter(
                status='ACCEPTED',
                updated_at__date=timezone.now().date()
            ).count(),
        }
    
    # Additional helper methods would be implemented here...
    def _get_daily_trends(self, applications, start_date, end_date):
        """Get daily application trends"""
        # Implementation for daily trends
        pass
    
    def _get_status_change_trends(self, start_date, end_date):
        """Get status change trends"""
        # Implementation for status changes
        pass
    
    def _identify_bottlenecks(self, applications):
        """Identify pipeline bottlenecks"""
        # Implementation for bottleneck analysis
        pass
    
    # ... more helper methods as needed