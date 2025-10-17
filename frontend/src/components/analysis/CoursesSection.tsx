// components/analysis/CoursesSection.tsx
import { useState } from 'react';
import Button from '@/components/Button';

interface CourseRecommendation {
  id: number;
  name: string;
  url: string;
  platform: string;
  duration?: string;
  level?: string;
}

interface CoursesSectionProps {
  recommendations?: CourseRecommendation[];
  courseCount: number;
  onCourseCountChange: (count: number) => void;
}

export default function CoursesSection({ 
  recommendations = [], 
  courseCount, 
  onCourseCountChange 
}: CoursesSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedCourses = showAll ? recommendations : recommendations.slice(0, courseCount);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">
        Courses & Certificates Recommendations
      </h2>

      {/* Course Count Selector */}
      <div className="mb-6">
        <label htmlFor="courseCount" className="block text-sm font-medium text-gray-700 mb-2">
          Number of course recommendations:
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

      {/* Course Recommendations */}
      <div className="space-y-4">
        {displayedCourses.length > 0 ? (
          displayedCourses.map((course, index) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                  {course.name}
                </h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
                  {course.platform}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                {course.duration && <span>⏱️ {course.duration}</span>}
                {course.level && <span>📊 {course.level}</span>}
              </div>

              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Course
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>No course recommendations available.</p>
            <p className="text-sm mt-1">Complete your profile to get personalized recommendations.</p>
          </div>
        )}
      </div>

      {/* Show More/Less Button */}
      {recommendations.length > courseCount && (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${recommendations.length} Courses`}
          </Button>
        </div>
      )}

      {/* Additional Resources */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">More Learning Platforms</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a href="https://coursera.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            Coursera
          </a>
          <a href="https://udemy.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            Udemy
          </a>
          <a href="https://edx.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            edX
          </a>
          <a href="https://linkedin.com/learning" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            LinkedIn Learning
          </a>
        </div>
      </div>
    </div>
  );
}