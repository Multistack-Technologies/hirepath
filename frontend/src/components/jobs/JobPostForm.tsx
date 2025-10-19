// components/jobs/JobPostForm.tsx
import { JobCreateData } from '@/types';
import { Skill, Degree, CertificateProvider } from '@/types';
import { EMPLOYMENT_TYPES, WORK_TYPES, EXPERIENCE_LEVELS } from '@/types';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import JobSkillsDisplay from '@/components/jobs/JobSkillsDisplay';
import DegreesDisplay from '@/components/jobs/DegreesDisplay';
import CertificateProvidersDisplay from '@/components/jobs/CertificateProvidersDisplay';
import Link from 'next/link';

interface JobPostFormProps {
  formData: JobCreateData;
  validationErrors: Record<string, string>;
  selectedSkills: Skill[];
  selectedDegrees: Degree[];
  selectedProviders: CertificateProvider[];
  isCreating: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSkillsEdit: () => void;
  onSkillsClear: () => void;
  onDegreesEdit: () => void;
  onDegreesClear: () => void;
  onProvidersEdit: () => void;
  onProvidersClear: () => void;
  onSubmit: (e: React.FormEvent) => void;
  // Add these new handlers to update form data
  onSkillsUpdate: (skills: Skill[]) => void;
  onDegreesUpdate: (degrees: Degree[]) => void;
  onProvidersUpdate: (providers: CertificateProvider[]) => void;
}

export default function JobPostForm({
  formData,
  validationErrors,
  selectedSkills,
  selectedDegrees,
  selectedProviders,
  isCreating,
  onChange,
  onNumberChange,
  onSkillsEdit,
  onSkillsClear,
  onDegreesEdit,
  onDegreesClear,
  onProvidersEdit,
  onProvidersClear,
  onSubmit,
  onSkillsUpdate,
  onDegreesUpdate,
  onProvidersUpdate
}: JobPostFormProps) {

  // Handler for when skills are cleared
  const handleSkillsClear = () => {
    onSkillsClear();
    onSkillsUpdate([]); // Update form data with empty array
  };

  // Handler for when degrees are cleared
  const handleDegreesClear = () => {
    onDegreesClear();
    onDegreesUpdate([]); // Update form data with empty array
  };

  // Handler for when providers are cleared
  const handleProvidersClear = () => {
    onProvidersClear();
    onProvidersUpdate([]); // Update form data with empty array
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Basic Information Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        
        <div className="space-y-6">
          <TextField
            label="Job Title *"
            name="title"
            value={formData.title}
            onChange={onChange}
            error={validationErrors.title}
            placeholder="e.g. Senior Frontend Developer"
            required
          />

          <div>
            <label className="block text-sm font-semibold text-[#130160] mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={8}
              className={`w-full p-3 border rounded-lg text-gray-600 shadow-sm focus:ring-2 focus:ring-offset-2 text-base
                ${validationErrors.description 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              placeholder="Describe the job responsibilities, requirements, and what you're looking for in a candidate..."
              required
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
          </div>

          <TextField
            label="Location *"
            name="location"
            value={formData.location}
            onChange={onChange}
            error={validationErrors.location}
            placeholder="e.g. New York, NY or Remote"
            required
          />
        </div>
      </div>

      {/* Job Details Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#130160] mb-2">
              Employment Type *
            </label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={onChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {EMPLOYMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#130160] mb-2">
              Work Type *
            </label>
            <select
              name="work_type"
              value={formData.work_type}
              onChange={onChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {WORK_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#130160] mb-2">
              Experience Level *
            </label>
            <select
              name="experience_level"
              value={formData.experience_level}
              onChange={onChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {EXPERIENCE_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Qualifications & Preferences Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Qualifications & Preferences</h2>
        
        <div className="space-y-8">
          {/* Required Skills */}
          <div className="border-b pb-6">
            <JobSkillsDisplay
              skills={selectedSkills}
              onEdit={onSkillsEdit}
              onClear={handleSkillsClear}
            />
          </div>

          {/* Preferred Degrees */}
          <div className="border-b pb-6">
            <DegreesDisplay
              degrees={selectedDegrees}
              onEdit={onDegreesEdit}
              onClear={handleDegreesClear}
            />
          </div>

          {/* Preferred Certificate Providers */}
          <div>
            <CertificateProvidersDisplay
              providers={selectedProviders}
              onEdit={onProvidersEdit}
              onClear={handleProvidersClear}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          These qualifications help match your job with the most suitable candidates.
        </p>
      </div>

      {/* Salary Information Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Salary Information (USD)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Minimum Salary"
            name="min_salary"
            type="number"
            value={formData.min_salary || ''}
            onChange={onNumberChange}
            error={validationErrors.min_salary}
            placeholder="50000"
            min="0"
          />

          <TextField
            label="Maximum Salary"
            name="max_salary"
            type="number"
            value={formData.max_salary || ''}
            onChange={onNumberChange}
            placeholder="120000"
            min="0"
          />
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Providing salary information can increase application rates by up to 40%
        </p>
      </div>

      {/* Application Details Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Details</h2>
        
        <div className="max-w-md">
          <TextField
            label="Closing Date"
            name="closing_date"
            type="date"
            value={formData.closing_date}
            onChange={onChange}
            error={validationErrors.closing_date}
            min={new Date().toISOString().split('T')[0]}
          />
          <p className="text-sm text-gray-500 mt-2">
            Leave empty if the job doesn't have a specific closing date. Candidates will see how many days are remaining to apply.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div>
            <p className="text-sm text-gray-600">
              All fields marked with * are required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedSkills.length} skills, {selectedDegrees.length} degrees, {selectedProviders.length} certificates selected
            </p>
            {/* Debug info - show the actual IDs that will be sent */}
            <div className="text-xs text-gray-400 mt-1">
              IDs to submit: 
              Skills: [{formData.skills_required_ids?.join(', ') || 'none'}], 
              Degrees: [{formData.courses_preferred_ids?.join(', ') || 'none'}], 
              Certs: [{formData.certificates_preferred_ids?.join(', ') || 'none'}]
            </div>
          </div>
          <div className="flex space-x-4">
            <Link href="/jobs">
              <Button variant="secondary" size="lg">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isCreating}
              disabled={isCreating}
            >
              {isCreating ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}