// components/profile/PersonalInfoSection.tsx (Alternative)
import Image from "next/image";
import { UserProfile } from "@/types";
import InfoField from "./InfoField";
import Button from "@/components/Button";
import { IoPersonCircle } from "react-icons/io5";

interface PersonalInfoProps {
  profile: UserProfile;
  onEdit: () => void;
}

// Helper function to format location as string
const formatLocation = (location: any): string => {
  if (!location) return '';
  
  const { city, country, address } = location;
  const parts = [city, country].filter(Boolean);
  const locationString = parts.join(', ');
  
  if (locationString && address) {
    return `${locationString} - ${address}`;
  }
  
  return locationString || address || '';
};

export default function PersonalInfoSection({
  profile,
  onEdit,
}: PersonalInfoProps) {
  const formattedLocation = formatLocation(profile.location);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-semibold text-purple-700 flex space-x-1 items-center">
          <IoPersonCircle className="w-6 h-6" />
          <h2>Personal Info</h2>
        </div>
        <Button variant="primary" size="md" onClick={onEdit}>
          EDIT PROFILE
        </Button>
      </div>

      <div className="flex items-start mb-6">
        <Image
          height={64}
          width={64}
          src={profile.avatarUrl || "/default_profile.svg"}
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
          {formattedLocation && (
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              📍 {formattedLocation}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="First Name" value={profile.first_name} />
        <InfoField label="Last Name" value={profile.last_name} />
        <InfoField label="Email" value={profile.email} />
        <InfoField label="Phone" value={profile.phone_number} />
        {formattedLocation && (
          <InfoField label="Location" value={formattedLocation} />
        )}
        {profile.linkedin_url && (
          <InfoField label="LinkedIn" value={profile.linkedin_url} />
        )}
      </div>
    </div>
  );
}