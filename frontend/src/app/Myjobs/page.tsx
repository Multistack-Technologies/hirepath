"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/Button";
import Link from "next/link";
import api from "@/lib/api";
import { Job } from "@/types";
import GroupText from "@/components/GroupText";
import ApplyPopupModal from "@/components/ApplyPopupModal";

export default function FindWork() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<"newest" | "oldest">("newest");
  const [error, setError] = useState<string | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [applicationSuccess, setApplicationSuccess] = useState<boolean>(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("q", searchQuery);
      }
      if (selectedSkills.length > 0) {
        selectedSkills.forEach((skill) => params.append("skill", skill));
      }
      params.append("sort", sortOption); // Add sort parameter

      // Fetch jobs using the constructed query string
      const response = await api.get<Job[]>(`/jobs/?${params.toString()}`);

      if (response.data && Array.isArray(response.data)) {
        setJobs(response.data);
        // Set the first job as selected by default if no job is selected
        if (response.data.length > 0 && !selectedJob) {
          setSelectedJob(response.data[0]);
        }
      } else {
        console.error(
          "API response format for jobs is unexpected:",
          response.data
        );
        setError("Failed to load jobs: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      // Try to get a user-friendly error message from the response
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to load jobs";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
  };

    // --- Handlers for Apply Popup Modal ---
  const openApplyModal = () => setIsApplyModalOpen(true);
  const closeApplyModal = () => setIsApplyModalOpen(false);

  // Handle applying to a job
  const handleApply = (jobId: number) => {
        console.log(`Applying to job ${jobId}`);
    // Open the apply popup modal
    openApplyModal();
  };

    const handleApplicationSuccess = (shortLetter: string) => {
    console.log("Application submitted successfully!", shortLetter);
    // You can show a success message or update the UI
    setApplicationSuccess(true);
    // Optionally, refetch job data to update the applications count
    // fetchJobs();
   
    router.push("/jobs")
  };

  // Handle toggling a skill filter
  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      setSelectedSkills((prev) => [...prev, skill]);
    }
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
    setSortOption("newest");
  };

  // Fetch data when the component mounts or when filters change
  useEffect(() => {
    fetchJobs();
  }, [searchQuery, selectedSkills, sortOption]); // Re-run when these dependencies change

  if (!user) {
    // Redirect to login if not authenticated
    router.push("/login");
    return <p>Loading...</p>;
  }

  return (
    <DashboardLayout pageTitle="Find Work">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {/* Optionally, provide a retry button */}
          <button
            onClick={fetchJobs}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Section */}

      {/* Main Content Area */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading jobs...</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Job List */}
            <div className="lg:col-span-2 space-y-4">
              <section className="w-full">
                <div>
                  <input
                    type="text"
                    placeholder="Search by Category, Company or ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="mb-4"></div>
                <div className="border border-amber-400">
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        "UX Designer",
                        "UI Designer",
                        "Product Designer",
                        "Visual Identity",
                      ].map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleToggleSkill(skill)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedSkills.includes(skill)
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end items-center">
                    <button
                      onClick={handleClearFilters}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
                <div className=""></div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500">Jobs For You</span>
                    <span className="ml-2 text-xs text-blue-600 font-medium">
                      Popular
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Sort:</span>
                    <select
                      value={sortOption}
                      onChange={(e) =>
                        setSortOption(e.target.value as "newest" | "oldest")
                      }
                      className="border border-gray-300 rounded-md p-1 text-sm"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                </div>
              </section>

              {jobs.length === 0 ? (
                <p className="text-gray-700">
                  No jobs found matching your criteria.
                </p>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer ${
                      selectedJob?.id === job.id
                        ? "border-2 border-indigo-500"
                        : ""
                    }`}
                    onClick={() => handleSelectJob(job)}
                  >
                    <div className="flex items-start mb-2">
                      {/* <img
                      src={job.company_logo_url || "https://via.placeholder.com/40"} // Use company logo or placeholder
                      alt={job.company_name}
                      className="w-10 h-10 rounded-full mr-3"
                    /> */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{job.title}</h3>
                        {/* <p className="text-sm text-gray-700">{job.company_name}, {job.department}</p> */}
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span>📍 {job.location}</span>
                          <span className="mx-1">•</span>
                          {/* <span>{job.views} views</span> */}
                          <span className="mx-1">•</span>
                          {/* <span>{job.applications_count} applied</span> */}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        {/* <div className="text-sm text-gray-500 mb-1">{job.job_type}</div>
                      <div className="text-lg font-bold text-indigo-700">${job.salary}/year</div> */}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column - Job Detail Preview */}
            <div
              className="lg:col-span-1 border border-amber-400
            "
            >
              {selectedJob ? (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <img
                        //   src={selectedJob.company_logo_url || "https://via.placeholder.com/40"}
                        //   alt={selectedJob.company_name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        {/* <h2 className="text-xl font-semibold text-gray-900">{selectedJob.company_name}</h2>
                      <p className="text-sm text-gray-700">{selectedJob.title}, {selectedJob.department}</p> */}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Bookmark"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"
                          />
                        </svg>
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="More info"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">
                      <span>📍 {selectedJob.location}</span>
                      <span className="mx-1">•</span>
                      {/* <span>{selectedJob.views} views</span>
                    <span className="mx-1">•</span>
                    <span>{selectedJob.applications_count} applied</span>
                   */}
                    </p>
                  </div>
                  <div className="mb-4">
                    <GroupText
                      title="Description"
                      value={
                        selectedJob.description || "No description available."
                      }
                    />
                    {/* <h3 className="text-lg font-semibold text-purple-700 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-700">
                      
                    </p> */}
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-purple-700 mb-2">
                      Requirements
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requirementIds &&
                      selectedJob.requirementIds.length > 0 ? (
                        selectedJob.requirementIds.map((reqId) => (
                          <span
                            key={reqId}
                            className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs"
                          >
                            {getSkillName(reqId)}{" "}
                            {/* Helper function to get skill name from ID */}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No requirements specified.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-purple-700 mb-2">
                      Team
                    </h3>
                    {/* <p className="text-sm text-gray-700">{selectedJob.department}</p> */}
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-purple-700 mb-2">
                      Salary
                    </h3>
                    {/* <p className="text-xl font-bold text-indigo-700">${selectedJob.salary}/year</p> */}
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-purple-700 mb-2">
                      Type
                    </h3>
                    {/* <p className="text-sm text-gray-700">{selectedJob.job_type}</p> */}
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-purple-700 mb-2">
                      Posted
                    </h3>
                    {/* <p className="text-sm text-gray-700">{selectedJob.posted_date || 'N/A'}</p> */}
                  </div>
                  <div className="mb-4">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleApply(selectedJob.id)}
                      className="w-full"
                    >
                      APPLY
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <p className="text-gray-700">
                    Select a job from the list to view details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          {/* --- Render the Apply Popup Modal --- */}
      {selectedJob && (
        <ApplyPopupModal
          isOpen={isApplyModalOpen}
          onClose={closeApplyModal}
          onApplySuccess={handleApplicationSuccess}
          userEmail={user.email}
          jobId={selectedJob.id}
        />
      )}
    </DashboardLayout>
  );
}

// Helper function to get skill name from ID (replace with actual logic)
const getSkillName = (reqId: number): string => {
  // In a real app, this would fetch the skill name from an API or local state
  // For now, return a placeholder
  return `Skill ${reqId}`;
};
