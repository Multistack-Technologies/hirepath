interface CompanyInfoProps {
  company: any;
}

export default function CompanyInfo({ company }: CompanyInfoProps) {
  if (!company) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm font-medium text-blue-800">
        Posting for: <span className="font-semibold">{company.name}</span>
      </p>
      {company.description && (
        <p className="text-sm text-blue-600 mt-1">{company.description}</p>
      )}
    </div>
  );
}