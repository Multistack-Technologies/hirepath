import { useState } from 'react';
import Button from '@/components/Button';

export interface CertificateRecommendation {
  certificate_name: string;
  provider: string;
  reason: string;
  relevance_score: number;
  skills_covered: string[];
  estimated_duration: string;
  difficulty_level: string;
  provider_info: {
    id: number;
    name: string;
    issuer_name: string;
    issuer_type: string;
    website: string;
    is_popular: boolean;
  };
}

interface JobRoleRecommendation {
  job_role: {
    id: number;
    title: string;
  };
  certificate_recommendations?: CertificateRecommendation[];
}

interface CoursesSectionProps {
  jobRoleRecommendations: JobRoleRecommendation[];
  courseCount: number;
  onCourseCountChange: (count: number) => void;
}

export default function CoursesSection({ 
  jobRoleRecommendations = [], 
  courseCount, 
  onCourseCountChange 
}: CoursesSectionProps) {
  const [selectedJobRole, setSelectedJobRole] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  // Flatten all certificate recommendations
  const allCertificates = jobRoleRecommendations.flatMap(job => 
    job.certificate_recommendations?.map(cert => ({
      ...cert,
      job_role_title: job.job_role.title
    })) || []
  );

  // Filter certificates by selected job role
  const filteredCertificates = selectedJobRole === 'all' 
    ? allCertificates 
    : allCertificates.filter(cert => cert.job_role_title === selectedJobRole);

  // Get unique job roles for filter
  const jobRoles = [...new Set(jobRoleRecommendations.map(job => job.job_role.title))];

  const displayedCertificates = showAll ? filteredCertificates : filteredCertificates.slice(0, courseCount);

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">
        Certificate Recommendations
      </h2>

      {/* Job Role Filter */}
      {jobRoles.length > 0 && (
        <div className="mb-6">
          <label htmlFor="jobRoleFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Job Role:
          </label>
          <select
            id="jobRoleFilter"
            value={selectedJobRole}
            onChange={(e) => setSelectedJobRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Job Roles</option>
            {jobRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      )}

      {/* Course Count Selector */}
      <div className="mb-6">
        <label htmlFor="courseCount" className="block text-sm font-medium text-gray-700 mb-2">
          Number of recommendations to show:
        </label>
        <div className="flex items-center space-x-3">
          <input
            id="courseCount"
            type="range"
            min="1"
            max="10"
            value={courseCount}
            onChange={(e) => onCourseCountChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700 min-w-8 text-center">
            {courseCount}
          </span>
        </div>
      </div>

      {/* Certificate Recommendations */}
      <div className="space-y-4">
        {displayedCertificates.length > 0 ? (
          displayedCertificates.map((certificate, index) => (
            <div
              key={`${certificate.provider_info.id}-${index}`}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {certificate.certificate_name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">{certificate.job_role_title}</p>
                </div>
                <div className="flex flex-col items-end space-y-1 ml-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(certificate.difficulty_level)}`}>
                    {certificate.difficulty_level}
                  </span>
                  <span className={`text-xs font-medium ${getRelevanceColor(certificate.relevance_score)}`}>
                    {certificate.relevance_score}% relevant
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-gray-700 mb-2">{certificate.reason}</p>
                
                {/* Skills Covered */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {certificate.skills_covered.slice(0, 3).map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {certificate.skills_covered.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      +{certificate.skills_covered.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {certificate.estimated_duration}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {certificate.provider_info.issuer_name}
                  </span>
                  {certificate.provider_info.is_popular && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                      Popular
                    </span>
                  )}
                </div>
                
                {certificate.provider_info.website && (
                  <a
                    href={certificate.provider_info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs"
                  >
                    View Details
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>No certificate recommendations available.</p>
            <p className="text-sm mt-1">Upload your resume to get personalized certificate recommendations.</p>
          </div>
        )}
      </div>

      {/* Show More/Less Button */}
      {filteredCertificates.length > courseCount && (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${filteredCertificates.length} Certificates`}
          </Button>
        </div>
      )}
    </div>
  );
}