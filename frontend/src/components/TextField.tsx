// src/components/TextField.tsx
import React, { InputHTMLAttributes, forwardRef } from 'react';

// Define the props for our TextField component
interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Optional label text
  error?: string; // Optional error message
  helperText?: string; // Optional helper text
  className?: string; // Allow additional Tailwind classes for the container
}

// Use forwardRef to allow parent components to pass refs to the input element
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  label,
  error,
  helperText,
  className = '',
  ...props // Pass through other standard input props (e.g., value, onChange, type, id, required)
}, ref) => {
  const hasError = !!error; // Convert error string to boolean

  return (
    <div className={`mb-4 ${className}`}> {/* Container for label, input, error */}
      {label && (
        <label
          htmlFor={props.id} // Associate label with input using id
          className="block text-sm font-semibold text-[#130160] mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref} // Attach the forwarded ref
        className={`w-full p-2 border rounded-md text-gray-600 shadow-sm focus:ring-2 focus:ring-offset-2
          ${hasError
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' // Error styles
            : 'border-gray-300 focus:ring-[#ffffff] focus:border-[#130160]' // Default/focus styles
          }`}
        {...props} // Spread other input props
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>} {/* Error message */}
      {!error && helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>} {/* Helper text */}
    </div>
  );
});

// Set display name for better debugging in React DevTools
TextField.displayName = 'TextField';

export default TextField;