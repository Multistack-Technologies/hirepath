import { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { useToast } from '@/context/ToastContext';
import {
  EyeIcon,
  CheckBadgeIcon,
  XMarkIcon,
  StarIcon
} from "@heroicons/react/24/outline";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: number;
    applicant_name: string;
    current_status: string;
  };
  onStatusUpdate: (updateData: {
    status: string;
    notes?: string;
    interview_date?: string;
  }) => Promise<void>;
}

export default function UpdateStatusModal({
  isOpen,
  onClose,
  candidate,
  onStatusUpdate
}: UpdateStatusModalProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(candidate.current_status);
  const [formData, setFormData] = useState({
    notes: '',
    interview_date: ''
  });

  const statusOptions = [
    { 
      value: 'REVIEWED', 
      label: 'Mark as Reviewed', 
      description: 'Candidate has been reviewed',
      variant: 'secondary' as const,
      icon: EyeIcon,
      toast: { type: 'success' as const, title: 'Candidate marked as reviewed!' }
    },
    { 
      value: 'SHORTLISTED', 
      label: 'Shortlist', 
      description: 'Move candidate to shortlist',
      variant: 'primary' as const,
      icon: CheckBadgeIcon,
      toast: { type: 'success' as const, title: 'Candidate shortlisted successfully!' }
    },
    { 
      value: 'REJECTED', 
      label: 'Reject', 
      description: 'Reject this candidate',
      variant: 'danger' as const,
      icon: XMarkIcon,
      toast: { type: 'warning' as const, title: 'Candidate rejected' }
    },
    { 
      value: 'HIRED', 
      label: 'Hire', 
      description: 'Hire this candidate',
      variant: 'success' as const,
      icon: StarIcon,
      toast: { type: 'success' as const, title: 'Candidate hired! Congratulations!' }
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const selectedOption = statusOptions.find(option => option.value === selectedStatus);
      
      // Show immediate toast
      if (selectedOption) {
        addToast({
          type: selectedOption.toast.type,
          title: selectedOption.toast.title,
        });
      }

      await onStatusUpdate({
        status: selectedStatus,
        notes: formData.notes || undefined,
        interview_date: formData.interview_date || undefined
      });
      
      onClose();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to update candidate status',
        message: error.response?.data?.error || 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(candidate.current_status);
    setFormData({
      notes: '',
      interview_date: ''
    });
    onClose();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'border-yellow-200 bg-yellow-50',
      'REVIEWED': 'border-blue-200 bg-blue-50',
      'SHORTLISTED': 'border-green-200 bg-green-50',
      'REJECTED': 'border-red-200 bg-red-50',
      'HIRED': 'border-indigo-200 bg-indigo-50'
    };
    return colors[status as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Candidate Status"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Candidate Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 text-sm">{candidate.applicant_name}</h4>
          <p className="text-xs text-gray-600 mt-1">Current status: <span className="font-medium">{candidate.current_status}</span></p>
        </div>

        {/* Status Selection - Button Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select New Status *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = selectedStatus === option.value;
              const isCurrent = candidate.current_status === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedStatus(option.value)}
                  disabled={isCurrent}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' 
                      : isCurrent
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-100 text-blue-600' : 
                      isCurrent ? 'bg-gray-200 text-gray-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <OptionIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        isSelected ? 'text-blue-900' : 
                        isCurrent ? 'text-gray-600' :
                        'text-gray-900'
                      }`}>
                        {option.label}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isSelected ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    {isCurrent && (
                      <div className="text-xs text-gray-500 font-medium">Current</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interview Date - Only show for shortlisted/hired */}
        {(selectedStatus === 'SHORTLISTED' || selectedStatus === 'HIRED') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Date
            </label>
            <input
              type="datetime-local"
              value={formData.interview_date}
              onChange={(e) => setFormData(prev => ({ ...prev, interview_date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Schedule an interview date for the candidate
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any notes or comments about this candidate..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            These notes will be visible to your team
          </p>
        </div>

        {/* Selected Status Preview */}
        <div className={`p-4 rounded-lg border ${getStatusColor(selectedStatus)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">New Status</p>
              <p className="text-sm text-gray-600 capitalize">{selectedStatus.toLowerCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Current Status</p>
              <p className="text-sm text-gray-600 capitalize">{candidate.current_status.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || selectedStatus === candidate.current_status}
          >
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
}