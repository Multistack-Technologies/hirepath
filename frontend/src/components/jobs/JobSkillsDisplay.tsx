// components/jobs/JobSkillsDisplay.tsx
import { Skill } from '@/types';
import Button from '@/components/Button';

interface JobSkillsDisplayProps {
  skills: Skill[];
  onEdit: () => void;
  onClear: () => void;
}

export default function JobSkillsDisplay({ 
  skills, 
  onEdit, 
  onClear 
}: JobSkillsDisplayProps) {
  if (skills.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-[#130160]">
            Required Skills
          </label>
          <Button
            variant="primary"
            size="sm"
            onClick={onEdit}
          >
            Add Skills
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          No skills selected. Click "Add Skills" to select required skills for this position.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[#130160]">
          Required Skills ({skills.length})
        </label>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
          >
            Edit Skills
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onClear}
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200"
          >
            {skill.name}
          </span>
        ))}
      </div>
      
      <p className="text-xs text-gray-500">
        These skills will be shown to candidates and used for matching.
      </p>
    </div>
  );
}