// components/jobs/ApplyModal.tsx
import { useState } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (coverLetter: string) => Promise<boolean>;
  jobTitle: string;
  companyName: string;
  isApplying: boolean;
}

export default function ApplyModal({
  isOpen,
  onClose,
  onApply,
  jobTitle,
  companyName,
  isApplying
}: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');

  const handleSubmit = async () => {
    const success = await onApply(coverLetter);
    if (success) {
      setCoverLetter('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Job"
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Job Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900">{jobTitle}</h3>
          <p className="text-blue-700 text-sm">{companyName}</p>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cover Letter (Optional)
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            placeholder="Tell the employer why you're a good fit for this position..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            A well-written cover letter can increase your chances of getting an interview.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isApplying}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isApplying}
            disabled={isApplying}
          >
            {isApplying ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}