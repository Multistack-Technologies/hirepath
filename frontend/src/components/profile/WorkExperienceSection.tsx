// components/profile/WorkExperienceSection.tsx
import { useState, useEffect } from "react";
import { UserProfile, WorkExperience } from "@/types";
import Button from "@/components/Button";
import WorkExperienceModal from "./WorkExperienceModal";
import api from "@/lib/api";
import { FiEdit2, FiTrash2, FiBriefcase, FiCalendar } from "react-icons/fi";
import { IoBriefcase } from "react-icons/io5";

interface WorkExperienceSectionProps {
  profile: UserProfile;
}

export default function WorkExperienceSection({
  profile,
}: WorkExperienceSectionProps) {
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkExperience, setEditingWorkExperience] =
    useState<WorkExperience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredWorkExperienceId, setHoveredWorkExperienceId] = useState<
    number | null
  >(null);

  const fetchWorkExperiences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/work-experience/user/");
      setWorkExperiences(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch work experiences:", error);
      setError(
        error.response?.data?.error || "Failed to load work experiences"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const handleAddWorkExperience = () => {
    setEditingWorkExperience(null);
    setIsModalOpen(true);
  };

  const handleEditWorkExperience = (workExperience: WorkExperience) => {
    setEditingWorkExperience(workExperience);
    setIsModalOpen(true);
  };

  const handleDeleteWorkExperience = async (workExperienceId: number) => {
    if (!confirm("Are you sure you want to delete this work experience?")) {
      return;
    }

    try {
      await api.delete(`/work-experience/${workExperienceId}/`);
      setWorkExperiences((prev) =>
        prev.filter((exp) => exp.id !== workExperienceId)
      );
    } catch (error: any) {
      console.error("Failed to delete work experience:", error);
      alert("Failed to delete work experience");
    }
  };

  const handleWorkExperienceAdded = (workExperience: WorkExperience) => {
    if (editingWorkExperience) {
      // Update existing work experience
      setWorkExperiences((prev) =>
        prev.map((exp) => (exp.id === workExperience.id ? workExperience : exp))
      );
    } else {
      // Add new work experience
      setWorkExperiences((prev) => [workExperience, ...prev]);
    }
    setIsModalOpen(false);
    setEditingWorkExperience(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const getDuration = (
    startDate: string,
    endDate: string | null,
    isCurrent: boolean
  ) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let duration = "";
    if (years > 0) {
      duration += `${years} yr${years !== 1 ? "s" : ""}`;
    }
    if (remainingMonths > 0) {
      duration += `${duration ? " " : ""}${remainingMonths} mo${
        remainingMonths !== 1 ? "s" : ""
      }`;
    }

    return duration || "Less than 1 month";
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-700">
            Work Experience
          </h2>
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
          <div className="text-xl font-semibold text-purple-700 flex space-x-1 items-center">
            {" "}
            <IoBriefcase className="w-6 h-6" />
            <h2>Work Experince</h2>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={handleAddWorkExperience}
          >
            + ADD EXPERIENCE
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchWorkExperiences}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        )}

        <div className="space-y-6">
          {workExperiences.length > 0 ? (
            workExperiences.map((workExperience) => (
              <div
                key={workExperience.id}
                className="border-l-4 border-blue-500 pl-4 py-3 group hover:bg-gray-50 rounded-r transition-colors duration-200 relative"
                onMouseEnter={() =>
                  setHoveredWorkExperienceId(workExperience.id)
                }
                onMouseLeave={() => setHoveredWorkExperienceId(null)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {workExperience.job_title}
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {workExperience.company_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <FiCalendar className="w-3 h-3 mr-1" />
                          {getDuration(
                            workExperience.start_date,
                            workExperience.end_date,
                            workExperience.is_current
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(workExperience.start_date)} -{" "}
                      {workExperience.end_date
                        ? formatDate(workExperience.end_date)
                        : "Present"}
                      {workExperience.is_current && (
                        <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Current
                        </span>
                      )}
                    </p>

                    {workExperience.description && (
                      <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                        {workExperience.description}
                      </p>
                    )}
                  </div>

                  {/* Action Icons - Only show when hovering over the work experience item */}
                  {hoveredWorkExperienceId === workExperience.id && (
                    <div className="flex space-x-2 ml-4">
                      {/* Edit Button with Icon and Tooltip */}
                      <div className="relative group">
                        <button
                          onClick={() =>
                            handleEditWorkExperience(workExperience)
                          }
                          className="flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                          Edit Experience
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>

                      {/* Delete Button with Icon and Tooltip */}
                      <div className="relative group">
                        <button
                          onClick={() =>
                            handleDeleteWorkExperience(workExperience.id)
                          }
                          className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                          Delete Experience
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
                <FiBriefcase className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500 mb-2">
                No work experience added yet.
              </p>
              <p className="text-sm text-gray-400">
                Add your professional work experience to showcase your career
                journey.
              </p>
            </div>
          )}
        </div>

        {workExperiences.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {workExperiences.length} position
              {workExperiences.length !== 1 ? "s" : ""} added
            </p>
          </div>
        )}
      </div>

      <WorkExperienceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWorkExperience(null);
        }}
        onWorkExperienceAdded={handleWorkExperienceAdded}
        existingWorkExperience={editingWorkExperience}
      />
    </>
  );
}
