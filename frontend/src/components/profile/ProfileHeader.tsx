import Button from '@/components/Button';

interface ProfileHeaderProps {
  onEdit: () => void;
}

export default function ProfileHeader({ onEdit }: ProfileHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
      <Button variant="primary" size="md" onClick={onEdit}>
        EDIT PROFILE
      </Button>
    </div>
  );
}