'use client'; 

import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; 
import Button from '@/components/Button'; 
import Link from 'next/link'; 
import  api  from '@/lib/api'; 
import { UserProfile, CompanyProfile } from '@/types'; 

export default function MyProfile() {
  const { user } = useAuth(); 
  const router = useRouter(); 

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null); 
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null); 

    try {
   
      const profileResponse = await api.get('/accounts/profile/'); 

      if (profileResponse.data) {
        setProfile(profileResponse.data);
      } else {
        console.error("API response format for profile is unexpected:", profileResponse.data);
        setError("Failed to load profile: Unexpected response format.");
      }

      if (user?.role === 'RECRUITER') {

        const companyProfileResponse = await api.get('/companies/me/'); 

        if (companyProfileResponse.data) {
          setCompanyProfile(companyProfileResponse.data);
        } else {

          setCompanyProfile(null);
        }
      }
    } catch (err: any) {
        console.error("Error fetching profile data:", err);

        const errorMessage = err.response?.data?.error || err.message || 'Failed to load profile';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

 
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleCreateCompanyProfile = () => {
    router.push('/profile/company/create');
  };

  useEffect(() => {
    if (!user) {

      router.push('/login');
      return;
    }

    fetchProfileData();
  }, [user, router]); 

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <DashboardLayout pageTitle="My Profile">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <Button variant="primary" size="md" onClick={handleEditProfile}>
          EDIT PROFILE
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {/* Optionally, provide a retry button */}
          <button
            onClick={fetchProfileData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Personal Info Section */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading profile...</p>
      ) : (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-purple-700">Personal Info</h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start mb-4">
              <img
                src={profile?.avatarUrl || "https://via.placeholder.com/40"} 
                alt={profile?.first_name || "User"}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <h3 className="font-bold text-gray-900">{profile?.first_name} {profile?.last_name}</h3>
                <p className="text-sm text-gray-700">{profile?.bio || "No bio available."}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Name</p>
                <p className="text-sm text-gray-900">{profile?.first_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Surname</p>
                <p className="text-sm text-gray-900">{profile?.last_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{profile?.phone}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Company Profile Section (Conditional for Recruiters) */}
      {user.role === 'RECRUITER' && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-purple-700">Company Profile</h2>
            <Button variant="secondary" size="md" onClick={handleCreateCompanyProfile}>
              {companyProfile ? 'EDIT PROFILE' : 'CREATE PROFILE'}
            </Button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {companyProfile ? (
              <>
                <div className="flex items-start mb-4">
                  <img
                    src={companyProfile.logoUrl || "https://via.placeholder.com/40"} // Use company logo or placeholder
                    alt={companyProfile.name}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{companyProfile.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{companyProfile.website}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-700">{companyProfile.description}</p>
                </div>
 
              </>
            ) : (
              <p className="text-sm text-gray-700">No Company Profile</p>
            )}
          </div>
        </section>
      )}

      {/* Graduate-Specific Section: Resume */}
      {user.role === 'graduate' && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-purple-700">Resume</h2>
            <Button variant="secondary" size="md" onClick={() => router.push('/upload')}>
              UPLOAD CV
            </Button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm text-gray-700">Upload your CV to receive AI-powered feedback.</p>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}