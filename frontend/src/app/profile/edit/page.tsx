
'use client'; 

import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; 
import Button from '@/components/Button'; 
import TextField from '@/components/TextField'; 
import Link from 'next/link'; 
import  api  from '@/lib/api'; 
import Image from 'next/image';


interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'graduate' | 'recruiter';
  phone: string;
  bio?: string; 
  avatarUrl?: string; 
}

export default function EditProfile() {
  const { user } = useAuth(); 
  const router = useRouter(); 


  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null); 

    try {
    
      const profileResponse = await api.get('/accounts/profile/'); 

      if (profileResponse.data) {
   
        setFormData(profileResponse.data);
     
        setFormState({
          first_name: profileResponse.data.first_name,
          last_name: profileResponse.data.last_name,
          email: profileResponse.data.email,
          phone: profileResponse.data.phone,
          bio: profileResponse.data.bio || '',
        });
      } else {
        console.error("API response format for profile is unexpected:", profileResponse.data);
        setError("Failed to load profile: Unexpected response format.");
      }
    } catch (err: any) {
        console.error("Error fetching profile data:", err);

        const errorMessage = err.response?.data?.error || err.message || 'Failed to load profile';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };


  const [formState, setFormState] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
  });

 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData) {
      setError('Profile data not loaded. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
    
      const updatedData = {
        first_name: formState.first_name,
        last_name: formState.last_name,
        email: formState.email,
        phone: formState.phone,
        bio: formState.bio,
        // Add other fields as needed
      };


      const response = await api.put('/profile/update/', updatedData); 

      setFormData(prev => prev ? { ...prev, ...updatedData } : null);
      setSuccess('Profile updated successfully!');

      setTimeout(() => {
        router.push('/profile');
      }, 1500);

    } catch (err: any) {
      console.error("Update error:", err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    <DashboardLayout pageTitle="Edit Profile">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
        <Button variant="secondary" size="md" onClick={() => router.push('/profile')}>
          Cancel
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

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success}</p>
        </div>
      )}

      {/* Edit Profile Form */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading profile...</p>
      ) : (
        <section>
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start mb-4">
              <Image
                height={0}
                width={0}
                src={formData?.avatarUrl || "/images.png"} // Use user's avatar or placeholder
                alt={formData?.first_name || "User"}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <h3 className="font-bold text-gray-900">{formData?.first_name} {formData?.last_name}</h3>
                <p className="text-sm text-gray-700">{formData?.bio || "No bio available."}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <TextField
                    id="first_name"
                    name="first_name"
                    label="Name"
                    type="text"
                    value={formState.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <TextField
                    id="last_name"
                    name="last_name"
                    label="Surname"
                    type="text"
                    value={formState.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <TextField
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <TextField
                    id="phone"
                    name="phone"
                    label="Phone no"
                    type="tel"
                    value={formState.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Summary
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formState.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  {/* <TextField
                    id="job_title"
                    name="job_title"
                    label="Job Title"
                    type="text"
                    value={formData?.job_title || ''} // If job title is part of the profile
                    onChange={(e) => setFormState(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="e.g., Software Developer Graduate"
                  /> */}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'UPDATE'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/profile')} // Go back to profile page
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}