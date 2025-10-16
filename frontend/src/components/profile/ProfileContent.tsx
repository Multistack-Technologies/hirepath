import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { UserProfile, CompanyProfile, Skill } from "@/types";
import ProfileHeader from "./ProfileHeader";
import ResumeUploadModal from "@/components/ResumeUploadModal";
import CompanyProfileSection from "./CompanyProfileSection";
import EducationSection from "./EducationSection";
import PersonalInfoSection from "./PersonalInfoSection";
import ProfileError from "./ProfileError";
import ResumeSection from "./ResumeSection";
import SkillsSection from "./SkillsSection";
import ProfileLoading from "./ProfileLoading";

interface ProfileData {
  user_profile: UserProfile;
  company_profile?: CompanyProfile;
  skills?: Skill[];
  resume_score?: number;
}

export default function ProfileContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profileResponse = await api.get("/accounts/profile/");

      if (profileResponse.data) {
        const data: ProfileData = {
          user_profile: profileResponse.data,
        };

        // Fetch role-specific data
        if (user?.role === "GRADUATE") {
          await fetchGraduateData(data);
        } else if (user?.role === "RECRUITER") {
          await fetchRecruiterData(data);
        }

        setProfileData(data);
      }
    } catch (err: any) {
      console.error("Error fetching profile data:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to load profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGraduateData = async (data: ProfileData) => {
    try {
      const skillsResponse = await api.get("/skills/user-skills/");
      if (skillsResponse.data) {
        data.skills = skillsResponse.data;
      }
    } catch (skillError) {
      console.warn("Could not fetch skills:", skillError);
    }

    try {
      const resumeResponse = await api.get("/resumes/my-resume/");
      if (resumeResponse.data?.score) {
        data.resume_score = resumeResponse.data.score;
      }
    } catch (resumeError) {
      console.warn("Could not fetch resume score:", resumeError);
    }
  };

  const fetchRecruiterData = async (data: ProfileData) => {
    try {
      const companyResponse = await api.get("/companies/my-company/");
      if (companyResponse.data) {
        data.company_profile = companyResponse.data;
      }
    } catch (companyError) {
      console.warn("Could not fetch company profile:", companyError);
    }
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleCreateCompanyProfile = () => {
    router.push("/companies/create");
  };

  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const handleUploadSuccess = (feedbackData: any) => {
    closeUploadModal();
    if (profileData && feedbackData.score) {
      setProfileData({
        ...profileData,
        resume_score: feedbackData.score,
      });
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (isLoading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} onRetry={fetchProfileData} />;
  if (!profileData)
    return (
      <ProfileError
        message="No profile data found"
        onRetry={fetchProfileData}
      />
    );

  return (
    <>
      <ProfileHeader onEdit={handleEditProfile} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInfoSection profile={profileData.user_profile} />

          {user?.role === "GRADUATE" && (
            <>
              <SkillsSection
                skills={profileData.skills || []}
                onSkillsUpdate={(newSkills) => {
                  if (profileData) {
                    setProfileData({
                      ...profileData,
                      skills: newSkills,
                    });
                  }
                }}
              />
              <EducationSection profile={profileData.user_profile} />
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          {user?.role === "GRADUATE" && (
            <ResumeSection
              resumeScore={profileData.resume_score}
              onUploadClick={openUploadModal}
            />
          )}
        </div>

        {/* Company Profile Section */}
        {user?.role === "RECRUITER" && (
          <div className="lg:col-span-3">
            <CompanyProfileSection
              companyProfile={profileData.company_profile}
              onCreateProfile={handleCreateCompanyProfile}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {user?.role === "GRADUATE" && (
        <ResumeUploadModal
          isOpen={isUploadModalOpen}
          onClose={closeUploadModal}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}
