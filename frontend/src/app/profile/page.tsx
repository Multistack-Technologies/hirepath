// src/app/profile/page.tsx
'use client'; // Mark as Client Component for interactivity

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/Button';
import Link from 'next/link';
import  api  from '@/lib/api';
import { UserProfile, CompanyProfile } from '@/types';
// Import the ResumeUploadModal component
import ResumeUploadModal from '@/components/ResumeUploadModal'; // Adjust path if needed

export default function MyProfile() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- State for Resume Upload Modal ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  // --- End State for Resume Upload Modal ---

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

  // --- Handlers for Resume Upload Modal ---
  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  // Optional: Handle success callback from the modal
  const handleUploadSuccess = (feedbackData: any) => {
    console.log("Resume uploaded successfully!", feedbackData);
    // You could update the profile state with the new resume score
    // Or trigger a refetch of profile data
    // For now, we'll just close the modal and show a success message
    closeUploadModal();
    // Optionally, refetch profile data to get the updated resume score
    // fetchProfileData();
    alert(`Resume uploaded! Your score is ${feedbackData.score}/100.`);
  };
  // --- End Handlers for Resume Upload Modal ---

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
    <DashboardLayout pageTitle="Profile">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <Button variant="primary" size="md" onClick={handleEditProfile}>
          EDIT PROFILE
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Personal Info, Skills, Education */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-purple-700">Personal Info</h2>
                </div>
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

              {/* Skills Section */}
              {user.role === 'GRADUATE' && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-purple-700 mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {/* Example skills - replace with actual data from your API */}
                    {/* {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill: any, index: number) => ( // Adjust type if needed
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${
                            skill.selected ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {skill.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No skills added yet.</p>
                    )} */}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {user.role === 'GRADUATE' && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-purple-700 mb-4">Education</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Tshwane University of Technology</h3>
                      <p className="text-sm text-gray-700">BSc in Information Systems</p>
                      <p className="text-xs text-gray-500">2021 - 2025</p>
                    </div>
                    {/* Add more education entries as needed */}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Resume Rating (Graduates Only) */}
            {user.role === 'GRADUATE' && (
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-purple-700">Resume Rating</h2>
                    {/* Use the new button to open the modal */}
                    <Button variant="secondary" size="md" onClick={openUploadModal}>
                      UPLOAD CV
                    </Button>
                  </div>
                  {/* Display resume score if available, otherwise show 0/10 */}
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold text-indigo-700">
                      {/* {profile?.resume?.score || 0}<span className="text-lg">/100</span> */}
                    </p>
                  </div>
                  <div className="text-sm text-gray-700 mb-4">
                    {/* <p><strong>File name:</strong> {profile?.resume?.fileName || 'N/A'}</p>
                    <p><strong>Date Uploaded:</strong> {profile?.resume?.uploadedAt || 'N/A'}</p> */}
                  </div>
                  {/* The UPLOAD CV button is now part of the header */}
                </div>
              </div>
            )}

            {/* Company Profile Section (Conditional for Recruiters) */}
            {user.role === 'RECRUITER' && (
              <div className="lg:col-span-3">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-purple-700">Company Profile</h2>
                    <Button variant="secondary" size="md" onClick={handleCreateCompanyProfile}>
                      {companyProfile ? 'EDIT PROFILE' : 'CREATE PROFILE'}
                    </Button>
                  </div>
                  {companyProfile ? (
                    <>
                      <div className="flex items-start mb-4">
                        <img
                          src={companyProfile.logoUrl || "https://via.placeholder.com/40"}
                          alt={companyProfile.name}
                          className="w-10 h-10 rounded-full mr-4"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900">{companyProfile.name}</h3>
                          <p className="text-sm text-gray-700">{companyProfile.description || "No description provided."}</p>
                          <p className="text-xs text-gray-500 mt-1">{companyProfile.website}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          {/* <p className="text-xs font-medium text-gray-500">Contact Person</p>
                          <p className="text-sm text-gray-900">{companyProfile.contact_person}</p> */}
                        </div>
                        <div>
                          {/* <p className="text-xs font-medium text-gray-500">Contact Email</p>
                          <p className="text-sm text-gray-900">{companyProfile.contact_email}</p> */}
                        </div>
                        <div>
                          {/* <p className="text-xs font-medium text-gray-500">Contact Phone</p>
                          <p className="text-sm text-gray-900">{companyProfile.contact_phone}</p> */}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-700">No Company Profile</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- Render the Resume Upload Modal --- */}
      {user.role === 'GRADUATE' && (
        <ResumeUploadModal
          isOpen={isUploadModalOpen}
          onClose={closeUploadModal}
          onUploadSuccess={handleUploadSuccess} // Pass the success handler
        />
      )}
      {/* --- End Render the Resume Upload Modal --- */}
    </DashboardLayout>
  );
}