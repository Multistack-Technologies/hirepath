// src/components/RequirementModal.tsx
'use client';

import { useEffect, useState } from 'react';
import  api  from '@/lib/api';

// Define the shape of a Skill object from the API
interface Skill {
  id: number;
  name: string;
}

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Updated: onAdd now expects an array of numbers (IDs)
  onAdd: (requirementIds: number[]) => void;
  // Updated: initialRequirements expects an array of numbers (IDs)
  initialRequirementIds?: number[];
}

export default function RequirementModal({ isOpen, onClose, onAdd, initialRequirementIds = [] }: RequirementModalProps) {
  if (!isOpen) return null;

  // State for managing UI and data
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]); // Skills fetched from API
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>(initialRequirementIds); // Store selected IDs
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch skills when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSkills();
    }
  }, [isOpen]);

  const fetchSkills = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch skills from Django backend
      const response = await api.get<{ id: number; name: string }[]>('/skills/'); // Specify response type

      if (response.data && Array.isArray(response.data)) {
        setAvailableSkills(response.data);
      } else {
        console.error("API response format for skills is unexpected:", response.data);
        setError("Failed to load skills: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching skills:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load skills';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter skills based on search term
  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selecting/deselecting a skill by its ID
  const handleToggleSkill = (skillId: number) => {
    setSelectedSkillIds(prevIds =>
      prevIds.includes(skillId)
        ? prevIds.filter(id => id !== skillId) // Deselect
        : [...prevIds, skillId]                 // Select
    );
  };

  // Handle saving the selected skill IDs
  const handleSave = () => {
    // Pass the array of selected IDs back to the parent component
    onAdd(selectedSkillIds);
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[60%] mx-4 h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Requirement</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchSkills}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Stack"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <p className="text-center text-gray-500">Loading skills...</p>
        ) : (
          <>
            {/* Skill Tags */}
            <div className="mb-4 h-[30vh] overflow-auto scroll-auto ">
              <div className="flex flex-wrap gap-2 ">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.id} // Use ID as key for list items
                    onClick={() => handleToggleSkill(skill.id)} // Toggle selection by ID
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedSkillIds.includes(skill.id) // Check selection by ID
                        ? 'bg-[#130160] text-white'
                        : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    }`}
                  >
                    {skill.name} {/* Display the skill name */}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Skills */}
            <div className="mb-4 ">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Selected Skills</h3>
              <div className="flex flex-wrap gap-2 overflow-y-scroll h-[15vh] scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                {/* Map selected IDs back to skill names for display */}
                {availableSkills
                  .filter(skill => selectedSkillIds.includes(skill.id)) // Find selected skills by ID
                  .map((skill) => (
                    <div
                      key={skill.id} // Use ID as key for selected items
                      className="flex items-center bg-[#130160] text-white px-3 py-1 rounded-full text-sm"
                    >
                      <span>{skill.name}</span> {/* Display the skill name */}
                      <button
                        onClick={() => handleToggleSkill(skill.id)} // Remove by ID
                        className="ml-2 text-white hover:text-gray-200"
                        aria-label={`Remove ${skill.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}