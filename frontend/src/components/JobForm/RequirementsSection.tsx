import { useState } from 'react';
import Button from '@/components/Button';
import { useSkills } from '@/hooks/useSkills';
import SkillsSelectionModal from '@/components/SelectionModals/SkillsSelectionModal';
import CertificatesSelectionModal from '@/components/SelectionModals/CertificatesSelectionModal';
import EducationSelectionModal from '@/components/SelectionModals/EducationSelectionModal';

interface RequirementsSectionProps {
  skillsRequiredIds: number[];
  certificatesPreferredIds: number[];
  coursesPreferredIds: number[];
  onSkillsRequiredChange: (skillIds: number[]) => void;
  onCertificatesPreferredChange: (certificateIds: number[]) => void;
  onCoursesPreferredChange: (degreeIds: number[]) => void;
}

export default function RequirementsSection({ 
  skillsRequiredIds, 
  certificatesPreferredIds, 
  coursesPreferredIds,
  onSkillsRequiredChange,
  onCertificatesPreferredChange,
  onCoursesPreferredChange
}: RequirementsSectionProps) {
  const { skills, getSkillName } = useSkills();
  
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isCertificatesModalOpen, setIsCertificatesModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);

  const handleRemoveSkill = (skillId: number) => {
    onSkillsRequiredChange(skillsRequiredIds.filter(id => id !== skillId));
  };

  const handleRemoveCertificate = (certificateId: number) => {
    onCertificatesPreferredChange(certificatesPreferredIds.filter(id => id !== certificateId));
  };

  const handleRemoveCourse = (courseId: number) => {
    onCoursesPreferredChange(coursesPreferredIds.filter(id => id !== courseId));
  };

  return (
    <div className="space-y-6">
      {/* Skills Required */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills Required
            </label>
            <p className="text-sm text-gray-500">Add the skills required for this position</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsSkillsModalOpen(true)}>
            ADD SKILLS
          </Button>
        </div>
        
        {skillsRequiredIds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skillsRequiredIds.map((id) => (
              <RequirementItem
                key={id}
                name={getSkillName(id)}
                onRemove={() => handleRemoveSkill(id)}
                color="indigo"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">
              No skills added yet. Click "ADD SKILLS" to add required skills.
            </p>
          </div>
        )}
      </div>

      {/* Certificates Preferred */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificates Preferred
            </label>
            <p className="text-sm text-gray-500">Add preferred certificates (optional)</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsCertificatesModalOpen(true)}>
            ADD CERTIFICATES
          </Button>
        </div>
        
        {certificatesPreferredIds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certificatesPreferredIds.map((id) => (
              <RequirementItem
                key={id}
                name={`Certificate ${id}`} // Replace with actual certificate name
                onRemove={() => handleRemoveCertificate(id)}
                color="blue"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">
              No certificates added yet. Click "ADD CERTIFICATES" to add preferred certificates.
            </p>
          </div>
        )}
      </div>

      {/* Education Preferred */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education Preferred
            </label>
            <p className="text-sm text-gray-500">Add preferred degrees or courses (optional)</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsEducationModalOpen(true)}>
            ADD EDUCATION
          </Button>
        </div>
        
        {coursesPreferredIds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coursesPreferredIds.map((id) => (
              <RequirementItem
                key={id}
                name={`Degree ${id}`} // Replace with actual degree name
                onRemove={() => handleRemoveCourse(id)}
                color="green"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">
              No education added yet. Click "ADD EDUCATION" to add preferred degrees or courses.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <SkillsSelectionModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        onSkillsSelected={onSkillsRequiredChange}
        initialSelectedIds={skillsRequiredIds}
      />

      {/* <CertificatesSelectionModal
        isOpen={isCertificatesModalOpen}
        onClose={() => setIsCertificatesModalOpen(false)}
        onCertificatesSelected={onCertificatesPreferredChange}
        initialSelectedIds={certificatesPreferredIds}
      /> */}

      <EducationSelectionModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        onEducationSelected={onCoursesPreferredChange}
        initialSelectedIds={coursesPreferredIds}
      />
    </div>
  );
}

function RequirementItem({ 
  name, 
  onRemove,
  color = "indigo"
}: { 
  name: string; 
  onRemove: () => void;
  color?: "indigo" | "blue" | "green";
}) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className={`flex items-center justify-between ${colorClasses[color]} border p-3 rounded-lg`}>
      <span className="font-medium text-sm">{name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 ml-2 font-bold transition-colors"
        aria-label={`Remove ${name}`}
      >
        ✕
      </button>
    </div>
  );
}