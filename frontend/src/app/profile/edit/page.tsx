// app/profile/edit/page.tsx
'use client'; 

import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import Button from '@/components/Button'; 
import TextField from '@/components/TextField'; 
import api from '@/lib/api'; 
import Image from 'next/image';
import { FiCamera, FiTrash2, FiUpload, FiX, FiMail } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'GRADUATE' | 'RECRUITER';
  phone_number: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  job_title: string;
  linkedin_url: string;
  location: {
    city?: string;
    country?: string;
    address?: string;
  };
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bio: string;
  job_title: string;
  linkedin_url: string;
  location: {
    city: string;
    country: string;
    address: string;
  };
  avatar?: File | string | null;
}

export default function EditProfile() {
  const { user } = useAuth(); 
  const router = useRouter(); 

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null); 

    try {
      const response = await api.get('/accounts/profile/'); 
      const profileData = response.data;

      if (profileData) {
        setProfile(profileData);
        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || '',
          phone_number: profileData.phone_number || profileData.phone || '',
          bio: profileData.bio || '',
          job_title: profileData.job_title || '',
          linkedin_url: profileData.linkedin_url || '',
          location: {
            city: profileData.location?.city || '',
            country: profileData.location?.country || '',
            address: profileData.location?.address || '',
          }
        });
        
        if (profileData.avatarUrl) {
          setAvatarPreview(profileData.avatarUrl);
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

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    bio: '',
    job_title: '',
    linkedin_url: '',
    location: {
      city: '',
      country: '',
      address: '',
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = async () => {
    try {
      await api.delete('/accounts/profile/avatar/delete/');
      setAvatarPreview(null);
      setAvatarFile(null);
      setSuccess('Avatar removed successfully');
    } catch (err: any) {
      console.error('Error removing avatar:', err);
      setError('Failed to remove avatar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profile) {
      setError('Profile data not loaded. Please try again.');
      return;
    }

    setIsSaving(true);

    try {
      const submitData = new FormData();
      
      // Append basic fields (excluding email since it's read-only)
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      // Email is not included since it's read-only in the backend too
      submitData.append('phone_number', formData.phone_number);
      submitData.append('bio', formData.bio);
      submitData.append('job_title', formData.job_title);
      submitData.append('linkedin_url', formData.linkedin_url);
      submitData.append('location', JSON.stringify(formData.location));

      // Append avatar if changed
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      const response = await api.put('/accounts/profile/update/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Profile updated successfully!');

      // Redirect after success
      setTimeout(() => {
        router.push('/profile');
      }, 1500);

    } catch (err: any) {
      console.error("Update error:", err);
      const errorMessage = err.response?.data?.error || 'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
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
    return (
      <DashboardLayout pageTitle="Edit Profile">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Edit Profile" >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
          <p className="text-gray-600 mt-1">Update your personal information and preferences</p>
        </div>
        <Button 
          variant="secondary" 
          size="md" 
          onClick={() => router.push('/profile')}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <p>{error}</p>
            <button onClick={() => setError(null)}>
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <p>{success}</p>
            <button onClick={() => setSuccess(null)}>
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="First Name *"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    label="Last Name *"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                  
                  {/* Disabled Email Field */}
                  <div className="relative">
                    <TextField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-9 text-gray-400">
                      <FiMail className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <TextField
                    label="Phone Number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Job Title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineer, Product Manager"
                  />
                  <TextField
                    label="LinkedIn Profile"
                    name="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-[#130160] mb-1">
                    Bio / Personal Summary
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#ffffff] focus:border-[#130160]"
                    placeholder="Tell us about yourself, your experience, and your goals..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Brief description of your professional background and interests
                  </p>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    label="City"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    placeholder="e.g., New York"
                  />
                  <TextField
                    label="Country"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleChange}
                    placeholder="e.g., United States"
                  />
                  <TextField
                    label="Address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => router.push('/profile')}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSaving}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Avatar Section */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                <div className="space-y-4">
                  {/* Avatar Preview */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                        {avatarPreview ? (
                          <Image
                            src={avatarPreview}
                            alt="Profile preview"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiCamera className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Upload Button - Gray */}
                  <div className="text-center">
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar"
                      className="inline-flex items-center px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 cursor-pointer transition-colors w-full justify-center"
                    >
                      <FiUpload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </label>
                  </div>

                  {avatarPreview && (
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={removeAvatar}
                        className="w-full"
                      >
                        Remove Photo
                      </Button>
                    </div>
                  )}

                  <p className="text-sm text-gray-500 text-center">
                    Recommended: Square image, at least 400x400px. Max 5MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}