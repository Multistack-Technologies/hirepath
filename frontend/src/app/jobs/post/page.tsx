// app/recruiter/jobs/post/page.tsx (fixed)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import JobPostForm from '@/components/jobs/JobPostForm';
import JobSkillsModal from '@/components/jobs/JobSkillsModal';
import DegreesModal from '@/components/jobs/DegreesModal';
import CertificateProvidersModal from '@/components/jobs/CertificateProvidersModal';
import { useJobPost } from '@/hooks/useJobPost';
import { useJobForm } from '@/hooks/useJobForm';
import { useSkillsSelection } from '@/hooks/useSkillsSelection';
import { useDegreesSelection } from '@/hooks/useDegreesSelection';
import { useCertificateProvidersSelection } from '@/hooks/useCertificateProvidersSelection';
import { 
  EMPLOYMENT_TYPES, 
  WORK_TYPES, 
  EXPERIENCE_LEVELS 
} from '@/types';

const initialFormData = {
  title: '',
  description: '',
  location: '',
  employment_type: 'FULL_TIME', // Fixed: Use string value directly
  work_type: 'ONSITE',
  experience_level: 'MID',
  min_salary: undefined,
  max_salary: undefined,
  closing_date: '',
  skills_required_ids: [],
  certificates_preferred_ids: [],
  courses_preferred_ids: [],
};

export default function PostJobPage() {
  const router = useRouter();
  const { createJob, isCreating, validationErrors, hasCompany, company } = useJobPost();
  const { formData, handleChange, handleNumberChange, updateSkills, updateDegrees, updateCertificateProviders } = useJobForm(initialFormData);
  
  // Selection hooks
  const { 
    availableSkills, 
    selectedSkills, 
    isLoading: skillsLoading, 
    handleSkillsSelected, 
    handleClearSkills,
    getSkillsIds 
  } = useSkillsSelection();

  const { 
    availableDegrees, 
    selectedDegrees, 
    isLoading: degreesLoading, 
    handleDegreesSelected, 
    handleClearDegrees,
    getDegreesIds 
  } = useDegreesSelection();

  const { 
    availableProviders, 
    selectedProviders, 
    isLoading: providersLoading, 
    handleProvidersSelected, 
    handleClearProviders,
    getProvidersIds 
  } = useCertificateProvidersSelection();

  // Modal states
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isDegreesModalOpen, setIsDegreesModalOpen] = useState(false);
  const [isCertificateProvidersModalOpen, setIsCertificateProvidersModalOpen] = useState(false);

  // Add the new update handlers that were missing
  const handleSkillsUpdate = (skills: any[]) => {
    const validSkillIds = skills
      .filter(skill => skill.id && skill.id > 0 && !isNaN(skill.id))
      .map(skill => skill.id);
    
    console.log('Updating skills:', skills, 'Valid IDs:', validSkillIds);
    updateSkills(validSkillIds);
  };

  const handleDegreesUpdate = (degrees: any[]) => {
    const validDegreeIds = degrees
      .filter(degree => degree.id && degree.id > 0 && !isNaN(degree.id))
      .map(degree => degree.id);
    
    console.log('Updating degrees:', degrees, 'Valid IDs:', validDegreeIds);
    updateDegrees(validDegreeIds);
  };

  const handleProvidersUpdate = (providers: any[]) => {
    const validProviderIds = providers
      .filter(provider => provider.id && provider.id > 0 && !isNaN(provider.id))
      .map(provider => provider.id);
    
    console.log('Updating providers:', providers, 'Valid IDs:', validProviderIds);
    updateCertificateProviders(validProviderIds);
  };

  // Update the save handlers to use the new update functions
  const handleSkillsSave = (skills: any[]) => {
    console.log('Skills selected in modal:', skills);
    handleSkillsSelected(skills);
    handleSkillsUpdate(skills);
  };

  const handleDegreesSave = (degrees: any[]) => {
    console.log('Degrees selected in modal:', degrees);
    handleDegreesSelected(degrees);
    handleDegreesUpdate(degrees);
  };

  const handleProvidersSave = (providers: any[]) => {
    console.log('Providers selected in modal:', providers);
    handleProvidersSelected(providers);
    handleProvidersUpdate(providers);
  };

  // Update clear handlers to also clear form data
  const handleClearSkillsWithForm = () => {
    handleClearSkills();
    handleSkillsUpdate([]);
  };

  const handleClearDegreesWithForm = () => {
    handleClearDegrees();
    handleDegreesUpdate([]);
  };

  const handleClearProvidersWithForm = () => {
    handleClearProviders();
    handleProvidersUpdate([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting job data:", formData);
    const success = await createJob(formData);
    if (success) {
      router.push('/jobs');
    }
  };

  const headerAction = (
    <Link href="/jobs">
      <Button variant="secondary" size="sm">
        View All Jobs
      </Button>
    </Link>
  );

  if (!hasCompany) {
    return (
      <DashboardLayout 
        pageTitle="Post a Job" 
        pageDescription="Create a new job posting"
        headerAction={headerAction}
      >
        <CompanyProfileRequired />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      pageTitle="Post a New Job" 
      pageDescription="Fill out the form below to create a new job posting"
      headerAction={headerAction}
    >
      <div className="max-w-4xl mx-auto">
        <CompanyBanner company={company} />
        
        <JobPostForm
          formData={formData}
          validationErrors={validationErrors}
          selectedSkills={selectedSkills}
          selectedDegrees={selectedDegrees}
          selectedProviders={selectedProviders}
          isCreating={isCreating}
          onChange={handleChange}
          onNumberChange={handleNumberChange}
          onSkillsEdit={() => setIsSkillsModalOpen(true)}
          onSkillsClear={handleClearSkillsWithForm}
          onDegreesEdit={() => setIsDegreesModalOpen(true)}
          onDegreesClear={handleClearDegreesWithForm}
          onProvidersEdit={() => setIsCertificateProvidersModalOpen(true)}
          onProvidersClear={handleClearProvidersWithForm}
          onSubmit={handleSubmit}
          // Add the missing handlers
          onSkillsUpdate={handleSkillsUpdate}
          onDegreesUpdate={handleDegreesUpdate}
          onProvidersUpdate={handleProvidersUpdate}
        />

        {/* Modals */}
        <JobSkillsModal
          isOpen={isSkillsModalOpen}
          onClose={() => setIsSkillsModalOpen(false)}
          onSkillsSelected={handleSkillsSave}
          existingSkills={selectedSkills}
          availableSkills={availableSkills}
          isLoading={skillsLoading}
        />

        <DegreesModal
          isOpen={isDegreesModalOpen}
          onClose={() => setIsDegreesModalOpen(false)}
          onDegreesSelected={handleDegreesSave}
          existingDegrees={selectedDegrees}
          availableDegrees={availableDegrees}
          isLoading={degreesLoading}
        />

        <CertificateProvidersModal
          isOpen={isCertificateProvidersModalOpen}
          onClose={() => setIsCertificateProvidersModalOpen(false)}
          onProvidersSelected={handleProvidersSave}
          existingProviders={selectedProviders}
          availableProviders={availableProviders}
          isLoading={providersLoading}
        />
      </div>
    </DashboardLayout>
  );
}

// Extracted components for better organization
function CompanyProfileRequired() {
  const router = useRouter();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-16">
        <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Company Profile Required</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          You need to create a company profile before you can post jobs.
        </p>
        <div className="space-x-4">
          <Button onClick={() => router.push('/profile/company/create')} variant="primary" size="lg">
            Create Company Profile
          </Button>
          <Button onClick={() => router.back()} variant="secondary" size="lg">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

function CompanyBanner({ company }: { company: any }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-800 font-semibold">Posting as: {company?.name}</p>
          <p className="text-sm text-blue-600">{company?.industry} • {company?.location}</p>
        </div>
        <Link href="/recruiter/company" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
          Edit Company
        </Link>
      </div>
    </div>
  );
}