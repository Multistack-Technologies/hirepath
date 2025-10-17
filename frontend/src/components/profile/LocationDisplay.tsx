// components/profile/LocationDisplay.tsx
interface Location {
  city?: string;
  country?: string;
  address?: string;
}

interface LocationDisplayProps {
  location?: Location | null;
  showIcon?: boolean;
  className?: string;
}

export default function LocationDisplay({ 
  location, 
  showIcon = true,
  className = "" 
}: LocationDisplayProps) {
  if (!location) return null;

  const { city, country, address } = location;
  
  // Create location parts
  const locationParts = [city, country].filter(Boolean);
  const locationString = locationParts.join(', ');
  
  // Determine what to display
  let displayText = '';
  if (locationString && address) {
    displayText = `${locationString} - ${address}`;
  } else if (locationString) {
    displayText = locationString;
  } else if (address) {
    displayText = address;
  }

  if (!displayText) return null;

  return (
    <p className={`text-sm text-gray-500 mt-1 flex items-center ${className}`}>
      {showIcon && '📍 '}
      {displayText}
    </p>
  );
}