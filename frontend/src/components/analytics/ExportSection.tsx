// components/analytics/ExportSection.tsx
import { useState } from 'react';
import Button from '@/components/Button';
import { Export, ExportRequestData, EXPORT_TYPES, EXPORT_FORMATS } from '@/types';

interface ExportSectionProps {
  exports: Export[];
  loading: boolean;
  onRequestExport: (data: ExportRequestData) => Promise<void>;
  onDownloadExport: (exportId: number) => Promise<void>;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  exports,
  loading,
  onRequestExport,
  onDownloadExport,
}) => {
  const [exportForm, setExportForm] = useState<ExportRequestData>({
    export_type: 'APPLICATIONS',
    format: 'EXCEL',
    filters: {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRequestExport(exportForm);
    setExportForm({ export_type: 'APPLICATIONS', format: 'EXCEL', filters: {} });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Export Request Form */}
      <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Request New Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Type
            </label>
            <select
              value={exportForm.export_type}
              onChange={(e) => setExportForm(prev => ({ ...prev, export_type: e.target.value }))}
              className="w-full border text-gray-700 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#130160] focus:border-[#130160]"
            >
              {EXPORT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={exportForm.format}
              onChange={(e) => setExportForm(prev => ({ ...prev, format: e.target.value }))}
              className="w-full border text-gray-700 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#130160] focus:border-[#130160]"
            >
              {EXPORT_FORMATS.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={loading}
              className="w-full"
            >
              Request Export
            </Button>
          </div>
        </div>
      </form>

      {/* Exports List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Exports</h3>
        
        {exports.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No exports requested yet.</p>
        ) : (
          <div className="space-y-3">
            {exports.map((exp) => (
              <div key={exp.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="font-medium text-gray-900">{exp.export_type}</span>
                    <span className="text-gray-500 ml-2">- {exp.format}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(exp.status)}`}>
                    {exp.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(exp.created_at)}
                  </span>
                </div>
                
                {exp.status === 'COMPLETED' && (
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => onDownloadExport(exp.id)}
                  >
                    Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};