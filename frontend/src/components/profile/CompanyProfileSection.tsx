import Image from 'next/image';
import Button from '@/components/Button';
import { CompanyProfile } from '@/types';
import InfoField from './InfoField';

interface CompanyProfileSectionProps {
  companyProfile?: CompanyProfile;
  onCreateProfile: () => void;
}

export default function CompanyProfileSection({ 
  companyProfile, 
  onCreateProfile 
}: CompanyProfileSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-700">Company Profile</h2>
        <Button variant="secondary" size="md" onClick={onCreateProfile}>
          {companyProfile ? 'EDIT PROFILE' : 'CREATE PROFILE'}
        </Button>
      </div>
      
      {companyProfile ? (
        <div className="space-y-4">
          <div className="flex items-start">
            <Image
              height={60}
              width={60}
              src={companyProfile.logoUrl || "/default-company.png"}
              alt={companyProfile.name}
              className="w-15 h-15 rounded-lg mr-4 object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{companyProfile.name}</h3>
              <p className="text-sm text-gray-700 mt-1">
                {companyProfile.description || "No description provided."}
              </p>
              {companyProfile.website && (
                <p className="text-sm text-blue-600 mt-1">
                  <a href={companyProfile.website} target="_blank" rel="noopener noreferrer">
                    {companyProfile.website}
                  </a>
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* <InfoField label="Industry" value={companyProfile.industry} />
            <InfoField label="Company Size" value={companyProfile.company_size} />
            <InfoField label="Location" value={companyProfile.location} />
            <InfoField label="Contact Email" value={companyProfile.contact_email} />
            <InfoField label="Contact Phone" value={companyProfile.contact_phone} /> */}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No company profile created yet.</p>
          <p className="text-sm text-gray-400">
            Create a company profile to post jobs and manage applications.
          </p>
        </div>
      )}
    </div>
  );
}