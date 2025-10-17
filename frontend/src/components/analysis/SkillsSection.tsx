// components/analysis/SkillsSection.tsx
import Button from '@/components/Button';

interface SkillsSectionProps {
  skillsDetected?: string[];
  missingSkills?: string[];
  onAddSkills: () => void;
}

export default function SkillsSection({ 
  skillsDetected = [], 
  missingSkills = [], 
  onAddSkills 
}: SkillsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-purple-700">Skills Recommendation</h2>
        <Button variant="primary" size="sm" onClick={onAddSkills}>
          Add Skills
        </Button>
      </div>

      {/* Your Current Skills */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Your Skills</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {skillsDetected.length} detected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {skillsDetected.length > 0 ? (
            skillsDetected.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm border border-green-200 flex items-center"
              >
                {skill}
                <span className="ml-1 text-green-600 text-xs">✓</span>
              </span>
            ))
          ) : (
            <div className="text-center w-full py-4 text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className="text-sm">No skills detected in your resume</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Skills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Recommended Skills for You</h3>
          {missingSkills.length > 0 && (
            <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
              +{missingSkills.length} recommended
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {missingSkills.length > 0 ? (
            missingSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm border border-blue-200 flex items-center hover:bg-blue-200 transition-colors cursor-pointer"
                onClick={onAddSkills}
                title={`Click to add ${skill}`}
              >
                {skill}
                <span className="ml-1 text-blue-600 text-xs">+</span>
              </span>
            ))
          ) : (
            <div className="text-center w-full py-2 text-gray-500">
              <p className="text-sm">Great job! Your skills are well-aligned with current market demands.</p>
            </div>
          )}
        </div>

        {/* Improvement Tip */}
        {missingSkills.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Improvement Opportunity</p>
                <p className="text-xs text-blue-700 mt-1">
                  Adding these {missingSkills.length} skills could increase your job match rate by up to 35%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddSkills}
            className="flex-1"
          >
            Add Recommended Skills
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddSkills}
            className="flex-1"
          >
            Manage All Skills
          </Button>
        </div>
      </div>
    </div>
  );
}