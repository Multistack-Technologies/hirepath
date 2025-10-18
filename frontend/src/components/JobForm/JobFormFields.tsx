import TextField from '@/components/TextField';
import { JobFormData } from '@/types';

interface JobFormFieldsProps {
  formData: JobFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function JobFormFields({ formData, onChange }: JobFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="title"
          name="title"
          label="Job Title"
          type="text"
          value={formData.title}
          onChange={onChange}
          required
          placeholder="e.g., Software Developer"
        />
        <TextField
          id="location"
          name="location"
          label="Location"
          type="text"
          value={formData.location}
          onChange={onChange}
          required
          placeholder="e.g., Johannesburg, South Africa"
        />
      </div>

      {/* Job Type Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700 mb-1">
            Employment Type
          </label>
          <select
            id="employment_type"
            name="employment_type"
            value={formData.employment_type}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="FREELANCE">Freelance</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="TEMPORARY">Temporary</option>
          </select>
        </div>

        <div>
          <label htmlFor="work_type" className="block text-sm font-medium text-gray-700 mb-1">
            Work Type
          </label>
          <select
            id="work_type"
            name="work_type"
            value={formData.work_type}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ONSITE">On-site</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        <div>
          <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            id="experience_level"
            name="experience_level"
            value={formData.experience_level}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ENTRY">Entry Level (0-2 years)</option>
            <option value="MID">Mid Level (2-5 years)</option>
            <option value="SENIOR">Senior Level (5+ years)</option>
            <option value="LEAD">Lead/Manager</option>
          </select>
        </div>
      </div>

      {/* Salary Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="min_salary"
          name="min_salary"
          label="Minimum Salary (USD)"
          type="number"
          value={formData.min_salary || ''}
          onChange={onChange}
          placeholder="e.g., 50000"
        />
        <TextField
          id="max_salary"
          name="max_salary"
          label="Maximum Salary (USD)"
          type="number"
          value={formData.max_salary || ''}
          onChange={onChange}
          placeholder="e.g., 80000"
        />
      </div>

      {/* Closing Date */}
      <div>
        <TextField
          id="closing_date"
          name="closing_date"
          label="Closing Date"
          type="date"
          value={formData.closing_date || ''}
          onChange={onChange}
          placeholder="Select closing date"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={6}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Describe the role, responsibilities, requirements, and what you're looking for in a candidate..."
          required
        />
      </div>
    </>
  );
}