// src/components/Button.tsx
import React, { ButtonHTMLAttributes } from 'react';

// Define the props for our Button component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // Content inside the button (e.g., text)
  variant?: 'primary' | 'secondary' | 'danger'; // Different styles
  size?: 'sm' | 'md' | 'lg'; // Different sizes
  isLoading?: boolean; // Show loading state
  className?: string; // Allow additional Tailwind classes
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary', // Default variant
  size = 'md',         // Default size
  isLoading = false,   // Default loading state
  className = '',      // Default additional classes
  disabled,
  ...props            // Pass through other standard button props (e.g., onClick, type)
}) => {
  // Define Tailwind classes based on props
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-[#130160] text-white hover:bg-[#130169] focus:ring-green-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className, // User-provided classes
  ].join(' ');

  return (
    <button
      type="button" // Default to button, can be overridden via props
      className={buttonClasses}
      disabled={disabled || isLoading} // Disable if explicitly disabled or loading
      {...props} // Spread other props like onClick, type, etc.
    >
      {isLoading ? (
        <span className="flex items-center">
          {/* Simple loading spinner */}
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children // Display the button text/children
      )}
    </button>
  );
};

export default Button;