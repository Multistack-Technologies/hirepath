// src/components/CandidateCard.tsx
import Image from 'next/image';
import Button from './Button'; // Import the reusable Button

interface CandidateCardProps {
  name: string;
  jobTitle: string;
  location: string;
  postedAgo: string;
  matchScore: string;
  onViewProfileClick?: () => void; // Optional callback for the button
  className?: string; // Allow additional Tailwind classes
}

export default function CandidateCard({
  name,
  jobTitle,
  location,
  postedAgo,
  matchScore,
  onViewProfileClick,
  className = '',
}: CandidateCardProps) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition ${className}`}>
      <div className="flex items-start">
        <Image
          src="https://via.placeholder.com/40" // Replace with actual avatar URL prop
          alt={name}
          className="w-10 h-10 rounded-full mr-4"
        />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{jobTitle}</h3>
          <p className="text-sm text-gray-700">{name}</p>
          <p className="text-xs text-gray-500 mt-1">
            <span>{location}</span>
            <span className="mx-2">•</span>
            <span>{postedAgo}</span>
            <span className="mx-2">•</span>
            <span>Matches {matchScore} requirement</span>
          </p>
        </div>
        <Button
          variant="secondary" // Use secondary variant for less prominent button
          size="sm"
          onClick={onViewProfileClick} // Call the passed function
          className="text-xs" // Smaller text for the button
        >
          View Profile
        </Button>
      </div>
    </div>
  );
}