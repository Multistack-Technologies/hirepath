// src/app/jobs/post/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import RequirementModal from '@/components/RequirementModal';
import  api  from '@/lib/api';

// Define the shape of the Job data
interface JobFormData {
  title: string;
  company: string; // Might be pre-filled or omitted if tied to user's company
  location: string;
  description: string;
  // Store requirement IDs as numbers
  requirementIds: number[];
}

export default function PostNewVacancy() {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role !== 'RECRUITER') {
    router.push('/dashboard');
    return <p>Access Denied. Recruiters only.</p>;
  }

  // State for managing UI and form data
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    description: '',
    requirementIds: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for the requirement modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // --- Optional: Fetch all skills for name lookup (for better display) ---
  // This is useful if you want to show skill names in the main form outside the modal.
  // If you only need IDs, you can skip this part and just display the count of selected IDs.
  
  interface Skill {
    id: number;
    name: string;
  }
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchAllSkillsForLookup = async () => {
      try {
        const response = await api.get<{ id: number; name: string }[]>('/skills/');
        if (response.data && Array.isArray(response.data)) {
          setAllSkills(response.data);
        }
      } catch (err) {
        console.error("Error fetching skills for lookup:", err);
        // Optionally set an error state for skill lookup
      }
    };

    fetchAllSkillsForLookup();
  }, []);
  // --- End Optional Skill Lookup ---
  

  // Handle input changes for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle opening the requirement modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Handle closing the requirement modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle receiving selected requirement IDs from the modal
  const handleAddRequirements = (requirementIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      // Update the formData with the new array of selected IDs
      requirementIds: requirementIds
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.location) {
      setError('Please provide a Job Title and Location.');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for submission
      // Send the array of requirement IDs under the 'requirements' key expected by the backend
      const jobDataToSend = {
        ...formData,
        requirements: formData.requirementIds // Backend expects 'requirements' as an array of IDs
      };

      // Send the job data to the backend
      const response = await api.post('/jobs/', jobDataToSend); // Replace with your actual endpoint

      setSuccess('Job vacancy created successfully!');

      setTimeout(() => {
        router.push('/jobs');
      }, 1500);

    } catch (err: any) {
      console.error("Create error:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create job vacancy. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Post New Vacancy">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Vacancy</h1>
        <Button variant="secondary" size="md" onClick={() => router.push('/jobs')}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success}</p>
        </div>
      )}

      <section>
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <TextField
                  id="title"
                  name="title"
                  label="Name"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div>
                <TextField
                  id="location"
                  name="location"
                  label="Location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Johannesburg, South Africa"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
              />
            </div>

            {/* Requirements Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenModal}
                >
                  ADD
                </Button>
              </div>
              {/* Display selected requirements */}
              {formData.requirementIds.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {/* Option 1: Simple display of count and IDs */}
                  {/* <li className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                    <span>{formData.requirementIds.length} skills selected (IDs: {formData.requirementIds.join(', ')})</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, requirementIds: [] }))} // Clear all
                      className="text-red-600 hover:text-red-800"
                      aria-label="Clear all requirements"
                    >
                      Clear
                    </button>
                  </li> */}

                  {/* Option 2: Display names (requires fetching all skills - see optional useEffect above) */}
                  {/* Uncomment the block below and the optional useEffect if you implement skill name lookup */}
                   
                  {allSkills.length > 0 ? (
                    formData.requirementIds.map((id) => {
                      const skill = allSkills.find(s => s.id === id);
                      return skill ? (
                        <li key={id} className="flex items-center justify-between bg-[#130160] p-2 rounded-md">
                          <span>{skill.name}</span>
                          <button
                            type="button"
                            onClick={() => handleAddRequirements(formData.requirementIds.filter(reqId => reqId !== id))} // Remove by ID
                            className="text-red-600 hover:text-red-800"
                            aria-label={`Remove requirement: ${skill.name}`}
                          >
                            ✕
                          </button>
                        </li>
                      ) : null; // Handle case where ID might not be found (shouldn't happen ideally)
                    })
                  ) : (
                    <li className="text-sm text-gray-500">Loading skill names...</li>
                  )}
                  
                </ul>
              ) : (
                <p className="text-sm text-gray-500 mt-1">No requirements added yet.</p>
              )}
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Posting...' : 'POST NEW VACANCY'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => router.push('/jobs')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Requirement Modal */}
      <RequirementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddRequirements}
        initialRequirementIds={formData.requirementIds} // Pass current selections to modal
      />
    </DashboardLayout>
  );
}