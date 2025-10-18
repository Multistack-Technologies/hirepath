// components/forms/RoleSelector.tsx
interface RoleSelectorProps {
  value: 'GRADUATE' | 'RECRUITER';
  onChange: (value: 'GRADUATE' | 'RECRUITER') => void;
  disabled?: boolean;
}

export default function RoleSelector({ value, onChange, disabled = false }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        I am a...
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        <RoleOption
          value="GRADUATE"
          selected={value === 'GRADUATE'}
          onChange={onChange}
          disabled={disabled}
          title="Graduate"
          description="Looking for opportunities"
          icon={<GraduateIcon />}
        />
        
        <RoleOption
          value="RECRUITER"
          selected={value === 'RECRUITER'}
          onChange={onChange}
          disabled={disabled}
          title="Recruiter"
          description="Hiring talent"
          icon={<RecruiterIcon />}
        />
      </div>
    </div>
  );
}

interface RoleOptionProps {
  value: 'GRADUATE' | 'RECRUITER';
  selected: boolean;
  onChange: (value: 'GRADUATE' | 'RECRUITER') => void;
  disabled: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function RoleOption({ value, selected, onChange, disabled, title, description, icon }: RoleOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      disabled={disabled}
      className={`p-4 border-2 rounded-lg text-left transition-all ${
        selected
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          selected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
        }`}>
          {icon}
        </div>
        <div>
          <div className={`font-medium ${selected ? 'text-indigo-800' : 'text-gray-900'}`}>
            {title}
          </div>
          <div className={`text-sm ${selected ? 'text-indigo-600' : 'text-gray-500'}`}>
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

function GraduateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
    </svg>
  );
}

function RecruiterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
    </svg>
  );
}