# analytics/analytics_engine.py
from django.db.models import Count, Q, Avg, Min, Max
from django.utils import timezone
from datetime import timedelta, datetime
from collections import defaultdict
import pandas as pd

class RecruitmentAnalyticsEngine:
    def __init__(self, recruiter):
        self.recruiter = recruiter
        # Lazy import to avoid circular imports
        from jobs.models import Job
        from applications.models import Application
        
        self.recruiter_jobs = Job.objects.filter(created_by=recruiter)
        self.applications = Application.objects.filter(job__in=self.recruiter_jobs)
    
    def get_recruiter_overview(self, days=30):
        """Get overview statistics for recruiter dashboard"""
        try:
            # Lazy import for Application model
            from applications.models import Application
            
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
            
            recent_applications = self.applications.filter(
                applied_at__date__range=[start_date, end_date]
            )
            
            # Calculate basic metrics - FIXED: Use actual Job model fields
            total_jobs = self.recruiter_jobs.count()
            
            # FIXED: Determine active jobs based on closing_date
            active_jobs = self.recruiter_jobs.filter(
                Q(closing_date__gte=end_date) | Q(closing_date__isnull=True)
            ).count()
            
            total_applications = recent_applications.count()
            
            # Calculate conversion rate safely
            hired_count = recent_applications.filter(status=Application.Status.ACCEPTED).count()
            conversion_rate = (hired_count / total_applications * 100) if total_applications > 0 else 0
            
            # Get applications trend
            applications_trend = self._get_applications_trend(days)
            
            # Get average match score
            avg_match_result = recent_applications.aggregate(avg_score=Avg('match_score'))
            average_match_score = round(avg_match_result['avg_score'] or 0, 2)
            
            # Get top performing jobs
            top_performing_jobs = self._get_top_performing_jobs(days)
            
            # Get quick stats
            quick_stats = self._get_quick_stats(recent_applications)
            
            # Get status distribution
            status_distribution = self._get_status_distribution(recent_applications)
            
            return {
                'period': f"Last {days} days",
                'total_jobs': total_jobs,
                'active_jobs': active_jobs,
                'total_applications': total_applications,
                'applications_trend': applications_trend,
                'conversion_rate': round(conversion_rate, 2),
                'average_match_score': average_match_score,
                'top_performing_jobs': top_performing_jobs,
                'quick_stats': quick_stats,
                'status_distribution': status_distribution
            }
        except Exception as e:
            print(f"Error in get_recruiter_overview: {e}")
            # Return safe default data
            return {
                'period': f"Last {days} days",
                'total_jobs': 0,
                'active_jobs': 0,
                'total_applications': 0,
                'applications_trend': [],
                'conversion_rate': 0,
                'average_match_score': 0,
                'top_performing_jobs': [],
                'quick_stats': {
                    'applications_today': 0,
                    'pending_review': 0,
                    'interviews_scheduled': 0,
                    'new_hires': 0,
                },
                'status_distribution': {}
            }
    
    def _get_status_distribution(self, applications):
        """Get application status distribution"""
        try:
            status_counts = applications.values('status').annotate(count=Count('id'))
            return {item['status']: item['count'] for item in status_counts}
        except Exception:
            return {}
    
    def _get_applications_trend(self, days):
        """Get applications trend over time"""
        try:
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
            
            # Generate date range
            date_range = [start_date + timedelta(days=x) for x in range(days + 1)]
            
            # Get applications grouped by date
            trends_data = self.applications.filter(
                applied_at__date__range=[start_date, end_date]
            ).extra({
                'date': "DATE(applied_at)"
            }).values('date').annotate(
                count=Count('id')
            ).order_by('date')
            
            # Convert to dictionary for easy lookup
            trends_dict = {item['date']: item['count'] for item in trends_data}
            
            # Build complete trend data
            trends = []
            for single_date in date_range:
                trends.append({
                    'date': single_date.isoformat(),
                    'count': trends_dict.get(single_date, 0)
                })
            
            return trends
        except Exception as e:
            print(f"Error in _get_applications_trend: {e}")
            return []
    
    def _get_top_performing_jobs(self, days):
        """Get top performing jobs by applications and conversions"""
        try:
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
            
            top_jobs = self.recruiter_jobs.filter(
                applications__applied_at__date__range=[start_date, end_date]
            ).annotate(
                application_count=Count('applications'),
                hire_count=Count('applications', filter=Q(applications__status='ACCEPTED')),
                avg_match=Avg('applications__match_score')
            ).order_by('-application_count')[:5]
            
            job_data = []
            for job in top_jobs:
                job_data.append({
                    'id': job.id,
                    'title': job.title,
                    'application_count': job.application_count,
                    'hire_count': job.hire_count,
                    'avg_match_score': round(job.avg_match or 0, 2),
                    'conversion_rate': round((job.hire_count / job.application_count * 100) if job.application_count > 0 else 0, 2)
                })
            
            return job_data
        except Exception as e:
            print(f"Error in _get_top_performing_jobs: {e}")
            return []
    
    def _get_quick_stats(self, applications):
        """Generate quick stats for dashboard"""
        try:
            today = timezone.now().date()
            from applications.models import Application
            
            return {
                'applications_today': applications.filter(
                    applied_at__date=today
                ).count(),
                'pending_review': applications.filter(status=Application.Status.PENDING).count(),
                'interviews_scheduled': applications.filter(status=Application.Status.INTERVIEW).count(),
                'new_hires': applications.filter(
                    status=Application.Status.ACCEPTED,
                    updated_at__date=today
                ).count(),
            }
        except Exception as e:
            print(f"Error in _get_quick_stats: {e}")
            return {
                'applications_today': 0,
                'pending_review': 0,
                'interviews_scheduled': 0,
                'new_hires': 0,
            }
    
    def get_applications_analysis(self, start_date, end_date, filters=None):
        """Detailed applications analysis"""
        try:
            from applications.models import Application
            
            applications = self._apply_filters(
                self.applications.filter(applied_at__date__range=[start_date, end_date]),
                filters
            )
            
            # Get status distribution
            status_counts = applications.values('status').annotate(count=Count('id'))
            applications_by_status = {
                item['status']: item['count'] 
                for item in status_counts
            }
            
            # Calculate quality metrics
            high_quality = applications.filter(match_score__gte=80).count()
            medium_quality = applications.filter(match_score__gte=60, match_score__lt=80).count()
            low_quality = applications.filter(match_score__lt=60).count()
            
            # Get detailed breakdown by job
            detailed_breakdown = list(
                applications.values('job__title', 'job__id').annotate(
                    total=Count('id'),
                    avg_match=Avg('match_score'),
                    hired=Count('id', filter=Q(status='ACCEPTED'))
                ).order_by('-total')[:10]
            )
            
            # Format the breakdown
            for item in detailed_breakdown:
                item['avg_match'] = round(item['avg_match'] or 0, 2)
                item['conversion_rate'] = round((item['hired'] / item['total'] * 100) if item['total'] > 0 else 0, 2)
            
            return {
                'summary': {
                    'total_applications': applications.count(),
                    'applications_by_status': applications_by_status,
                    'average_match_score': round(applications.aggregate(avg=Avg('match_score'))['avg'] or 0, 2),
                },
                'trends': {
                    'daily_applications': self._get_daily_trends_for_period(applications, start_date, end_date),
                },
                'quality_metrics': {
                    'high_quality': high_quality,
                    'medium_quality': medium_quality,
                    'low_quality': low_quality,
                },
                'detailed_breakdown': detailed_breakdown
            }
        except Exception as e:
            print(f"Error in get_applications_analysis: {e}")
            return self._get_empty_applications_analysis()
    
    def _get_daily_trends_for_period(self, applications, start_date, end_date):
        """Get daily trends for a specific period"""
        try:
            trends = applications.extra({
                'date': "DATE(applied_at)"
            }).values('date').annotate(
                count=Count('id')
            ).order_by('date')
            return list(trends)
        except Exception:
            return []
    
    def _get_empty_applications_analysis(self):
        """Return empty applications analysis structure"""
        return {
            'summary': {
                'total_applications': 0,
                'applications_by_status': {},
                'average_match_score': 0,
            },
            'trends': {'daily_applications': []},
            'quality_metrics': {
                'high_quality': 0,
                'medium_quality': 0,
                'low_quality': 0,
            },
            'detailed_breakdown': []
        }
    
    def get_candidate_pipeline(self, start_date, end_date):
        """Candidate pipeline analysis"""
        try:
            applications = self.applications.filter(applied_at__date__range=[start_date, end_date])
            
            pipeline_data = applications.values('status').annotate(
                count=Count('id'),
                avg_match=Avg('match_score'),
                min_match=Min('match_score'),
                max_match=Max('match_score')
            ).order_by('status')
            
            # Format the data
            formatted_data = []
            for item in pipeline_data:
                formatted_data.append({
                    'status': item['status'],
                    'count': item['count'],
                    'avg_match': round(item['avg_match'] or 0, 2),
                    'min_match': round(item['min_match'] or 0, 2),
                    'max_match': round(item['max_match'] or 0, 2)
                })
            
            return {
                'pipeline_stages': formatted_data,
                'total_candidates': applications.count()
            }
        except Exception as e:
            print(f"Error in get_candidate_pipeline: {e}")
            return {
                'pipeline_stages': [],
                'total_candidates': 0
            }
    
    def get_source_analysis(self, start_date, end_date):
        """Application source performance analysis"""
        try:
            applications = self.applications.filter(applied_at__date__range=[start_date, end_date])
            
            # For now, return basic source analysis
            # You can enhance this when you have actual source tracking
            source_data = [{
                'application_source': 'Direct Application',
                'total_applications': applications.count(),
                'avg_match_score': round(applications.aggregate(avg=Avg('match_score'))['avg'] or 0, 2),
                'conversion_rate': round((applications.filter(status='ACCEPTED').count() / applications.count() * 100) if applications.count() > 0 else 0, 2)
            }]
            
            return {
                'source_performance': source_data,
                'total_sources': len(source_data)
            }
        except Exception as e:
            print(f"Error in get_source_analysis: {e}")
            return {
                'source_performance': [],
                'total_sources': 0
            }
    
    def _apply_filters(self, queryset, filters):
        """Apply filters to queryset"""
        if not filters:
            return queryset
        
        if filters.get('status'):
            queryset = queryset.filter(status=filters['status'])
        if filters.get('min_match_score'):
            try:
                queryset = queryset.filter(match_score__gte=float(filters['min_match_score']))
            except (ValueError, TypeError):
                pass
        if filters.get('job_id'):
            queryset = queryset.filter(job_id=filters['job_id'])
            
        return queryset
    
    def generate_comprehensive_report(self, report_type, date_range_start, date_range_end, filters=None):
        """Generate comprehensive report based on type"""
        try:
            if report_type == 'APPLICATION_ANALYSIS':
                return self.get_applications_analysis(date_range_start, date_range_end, filters)
            elif report_type == 'CANDIDATE_PIPELINE':
                return self.get_candidate_pipeline(date_range_start, date_range_end)
            elif report_type == 'TIME_TO_HIRE':
                return self.get_time_to_hire_analysis(date_range_start, date_range_end)
            elif report_type == 'SOURCE_ANALYSIS':
                return self.get_source_analysis(date_range_start, date_range_end)
            elif report_type == 'SKILL_GAP_ANALYSIS':
                return self.get_skill_gap_analysis(date_range_start, date_range_end)
            else:
                return {'error': 'Unsupported report type'}
        except Exception as e:
            return {'error': f'Report generation failed: {str(e)}'}
    
    def get_time_to_hire_analysis(self, start_date, end_date):
        """Time to hire metrics analysis"""
        try:
            from applications.models import Application
            
            hired_applications = self.applications.filter(
                status=Application.Status.ACCEPTED,
                updated_at__date__range=[start_date, end_date]
            )
            
            time_metrics = []
            for app in hired_applications:
                try:
                    days_to_hire = (app.updated_at.date() - app.applied_at.date()).days
                    time_metrics.append({
                        'job_title': app.job.title,
                        'applicant_name': app.applicant.get_full_name(),
                        'days_to_hire': days_to_hire,
                        'applied_date': app.applied_at.date().isoformat(),
                        'hired_date': app.updated_at.date().isoformat(),
                        'match_score': app.match_score or 0
                    })
                except Exception:
                    continue
            
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
                    'total_hires': len(time_metrics)
                }
            }
        except Exception as e:
            print(f"Error in get_time_to_hire_analysis: {e}")
            return {
                'time_metrics': {
                    'average_time_to_hire': 0,
                    'fastest_hire': None,
                    'slowest_hire': None,
                    'total_hires': 0
                }
            }
    
    def get_skill_gap_analysis(self, start_date, end_date):
        """Analyze skill gaps across applications"""
        try:
            applications = self.applications.filter(
                applied_at__date__range=[start_date, end_date]
            ).select_related('applicant', 'job')[:50]  # Limit for performance
            
            skill_gaps = []
            
            for app in applications:
                try:
                    # Simple skill gap analysis
                    match_score = app.match_score or 0
                    if match_score < 70:  # Consider low match scores as having skill gaps
                        skill_gaps.append({
                            'application_id': app.id,
                            'job_title': app.job.title,
                            'applicant_name': app.applicant.get_full_name(),
                            'match_score': match_score,
                            'gap_severity': 'High' if match_score < 50 else 'Medium'
                        })
                except Exception:
                    continue
            
            return {
                'summary': {
                    'total_applications_with_gaps': len(skill_gaps),
                    'high_severity_gaps': len([g for g in skill_gaps if g['gap_severity'] == 'High']),
                    'medium_severity_gaps': len([g for g in skill_gaps if g['gap_severity'] == 'Medium']),
                },
                'detailed_analysis': skill_gaps[:20]
            }
        except Exception as e:
            print(f"Error in get_skill_gap_analysis: {e}")
            return {
                'summary': {
                    'total_applications_with_gaps': 0,
                    'high_severity_gaps': 0,
                    'medium_severity_gaps': 0,
                },
                'detailed_analysis': []
            }