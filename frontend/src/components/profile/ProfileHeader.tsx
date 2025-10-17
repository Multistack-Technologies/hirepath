// components/profile/ProfileHeader.tsx
export default function ProfileHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
      {/* Edit button removed from here - now it's in PersonalInfoSection */}
    </div>
  );
}