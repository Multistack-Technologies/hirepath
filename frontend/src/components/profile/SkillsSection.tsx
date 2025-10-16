import Link from 'next/link';
import { Skill } from '@/types';

interface SkillsSectionProps {
  skills: Skill[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <span
              key={skill.id}
              className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 border border-indigo-200"
            >
              {skill.name}
            </span>
          ))
        ) : (
          <div className="text-center w-full py-4">
            <p className="text-sm text-gray-500 mb-2">No skills added yet.</p>
            <Link 
              href="/profile/skills" 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Add your skills
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}