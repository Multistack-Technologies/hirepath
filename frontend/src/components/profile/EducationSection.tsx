// components/profile/EducationSection.tsx
import { useState, useEffect } from 'react';
import { UserProfile, Education } from '@/types';
import Button from '@/components/Button';
import EducationModal from './EducationModal';
import api from '@/lib/api';
import { FiEdit, FiTrash, FiBook } from 'react-icons/fi';
import { FaUserGraduate } from "react-icons/fa6";

interface EducationSectionProps {
  profile: UserProfile;
}

export default function EducationSection({ profile }: EducationSectionProps) {
  const [educations, setEducations] = useState<Education[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEducationId, setHoveredEducationId] = useState<number | null>(null);

  const fetchEducations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/education/user/');
      setEducations(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch educations:', error);
      setError(error.response?.data?.error || 'Failed to load educations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEducations();
  }, []);

  const handleAddEducation = () => {
    setEditingEducation(null);
    setIsModalOpen(true);
  };

  const handleEditEducation = (education: Education) => {
    setEditingEducation(education);
    setIsModalOpen(true);
  };

  const handleDeleteEducation = async (educationId: number) => {
    if (!confirm('Are you sure you want to delete this education?')) {
      return;
    }

    try {
      await api.delete(`/educations/${educationId}/`);
      setEducations(prev => prev.filter(edu => edu.id !== educationId));
    } catch (error: any) {
      console.error('Failed to delete education:', error);
      alert('Failed to delete education');
    }
  };

  const handleEducationAdded = (education: Education) => {
    if (editingEducation) {
      // Update existing education
      setEducations(prev => 
        prev.map(edu => edu.id === education.id ? education : edu)
      );
    } else {
      // Add new education
      setEducations(prev => [education, ...prev]);
    }
    setIsModalOpen(false);
    setEditingEducation(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          
          <h2 className="text-xl font-semibold text-purple-700">Education</h2>
          <Button variant="secondary" size="md" disabled>
            Loading...
          </Button>
        </div>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-semibold text-purple-700 flex space-x-1 items-center">    <FaUserGraduate className="w-6 h-6" />
          <h2>Education</h2></div>
       
          <Button variant="secondary" size="md" onClick={handleAddEducation}>
            + ADD EDUCATION
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchEducations}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        <div className="space-y-4">
          {educations.length > 0 ? (
            educations.map((education) => (
              <div
                key={education.id}
                className="border-l-4 border-indigo-500 pl-4 py-3 group hover:bg-gray-50 rounded-r transition-colors duration-200 relative"
                onMouseEnter={() => setHoveredEducationId(education.id)}
                onMouseLeave={() => setHoveredEducationId(null)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {education.degree.name}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {education.university.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(education.start_date)} -{' '}
                      {education.end_date 
                        ? formatDate(education.end_date) 
                        : 'Present'
                      }
                      {education.is_current && ' (Current)'}
                    </p>
                    {education.gpa && (
                      <p className="text-xs text-gray-600 mt-1">
                        GPA: {education.gpa}/{education.gpa_scale}
                      </p>
                    )}
                    {education.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {education.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Action Icons - Only show when hovering over the education item */}
                  {hoveredEducationId === education.id && (
                    <div className="flex space-x-2 ml-4">
                      {/* Edit Button with Icon and Tooltip */}
                      <div className="relative group">
                        <button
                          onClick={() => handleEditEducation(education)}
                          className="flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                          Edit Education
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                      
                      {/* Delete Button with Icon and Tooltip */}
                      <div className="relative group">
                        <button
                          onClick={() => handleDeleteEducation(education.id)}
                          className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                        >
                          <FiTrash className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                          Delete Education
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <FiBook className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500 mb-2">No education added yet.</p>
              <p className="text-sm text-gray-400">
                Add your educational background to complete your profile.
              </p>
            </div>
          )}
        </div>
        
        {educations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {educations.length} education{educations.length !== 1 ? 's' : ''} added
            </p>
          </div>
        )}
      </div>

      <EducationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEducation(null);
        }}
        onEducationAdded={handleEducationAdded}
        existingEducation={editingEducation}
      />
    </>
  );
}