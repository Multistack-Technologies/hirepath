import Button from '@/components/Button';
import { useRouter } from 'next/navigation';

interface FormActionsProps {
  isLoading: boolean;
  isCompanyLoading: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export default function FormActions({ 
  isLoading, 
  isCompanyLoading, 
  onCancel,
  submitLabel = "POST NEW VACANCY" 
}: FormActionsProps) {
  const router = useRouter();

  const handleCancel = () => {
    onCancel();
    router.push("/jobs");
  };

  return (
    <div className="flex space-x-4 pt-4 border-t border-gray-200">
      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        disabled={isLoading}
        className="flex-1"
      >
        {isLoading ? "Posting..." : submitLabel}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={handleCancel}
        disabled={isLoading || isCompanyLoading}
        className="flex-1"
      >
        Cancel
      </Button>
    </div>
  );
}