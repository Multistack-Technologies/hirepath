// components/profile/PersonalInfoSection.tsx
import Image from 'next/image';
import { UserProfile } from '@/types';
import InfoField from './InfoField';
import Button from '@/components/Button';

interface PersonalInfoProps {
  profile: UserProfile;
  onEdit: () => void;
}

export default function PersonalInfoSection({ profile, onEdit }: PersonalInfoProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-purple-700">Personal Info</h2>
        <Button variant="primary" size="md" onClick={onEdit}>
          EDIT PROFILE
        </Button>
      </div>
      
      <div className="flex items-start mb-6">
        <Image
          height={64}
          width={64}
          src={profile.avatarUrl || "/images.png"}
          alt={`${profile.first_name} ${profile.last_name}`}
          className="w-16 h-16 rounded-full mr-4 object-cover"
        />
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            {profile.first_name} {profile.last_name}
          </h3>
          <p className="text-sm text-gray-700 mt-1">
            {profile.bio || "No bio available."}
          </p>
          {profile.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              📍 {profile.location}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="First Name" value={profile.first_name} />
        <InfoField label="Last Name" value={profile.last_name} />
        <InfoField label="Email" value={profile.email} />
        <InfoField label="Phone" value={profile.phone_number} />
        {profile.location && <InfoField label="Location" value={profile.location} />}
        {profile.linkedin_url && <InfoField label="LinkedIn" value={profile.linkedin_url} />}
      </div>
    </div>
  );
}