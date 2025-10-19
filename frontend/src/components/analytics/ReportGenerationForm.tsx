// components/analytics/ReportGenerationForm.tsx
import { useState } from 'react';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { GenerateReportData, REPORT_TYPES } from '@/types';

interface ReportGenerationFormProps {
  onSubmit: (data: GenerateReportData) => Promise<void>;
  loading: boolean;
}

export const ReportGenerationForm: React.FC<ReportGenerationFormProps> = ({
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<GenerateReportData>({
    report_type: 'APPLICATION_ANALYSIS',
    title: '',
    date_range_start: '',
    date_range_end: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: keyof GenerateReportData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            value={formData.report_type}
            onChange={(e) => handleChange('report_type', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#130160] focus:border-[#130160]"
            required
          >
            {REPORT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <TextField
          label="Report Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Start Date"
          type="date"
          value={formData.date_range_start}
          onChange={(e) => handleChange('date_range_start', e.target.value)}
          required
        />

        <TextField
          label="End Date"
          type="date"
          value={formData.date_range_end}
          onChange={(e) => handleChange('date_range_end', e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#130160] focus:border-[#130160]"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        disabled={loading}
        className="w-full md:w-auto"
      >
        Generate Report
      </Button>
    </form>
  );
};