import { UserProfile } from '@/types';

interface EducationSectionProps {
  profile: UserProfile;
}

export default function EducationSection({ profile }: EducationSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Education</h2>
      <div className="space-y-4">
        <div className="border-l-4 border-indigo-500 pl-4">
          <h3 className="font-bold text-gray-900">Tshwane University of Technology</h3>
          <p className="text-sm text-gray-700">BSc in Information Systems</p>
          <p className="text-xs text-gray-500">2021 - 2025</p>
        </div>
      </div>
    </div>
  );
}