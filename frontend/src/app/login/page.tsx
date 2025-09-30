// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import api from "@/utils/api"; // ✅ use shared API

// export default function LoginPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await api.post("/accounts/login/", {
//         email: formData.email,
//         password: formData.password,
//       });

//       // Save tokens
//       localStorage.setItem("access", res.data.access);
//       localStorage.setItem("refresh", res.data.refresh);

//       router.push("/dashboard");
//     } catch (err) {
//       setError("Invalid email or password");
//     }
//   };

//   return (
//     <div className="min-h-screen flex">
//       {/* Left side */}
//       <div className="w-1/2 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center text-white">
//         <h1 className="text-4xl font-bold">Welcome Back</h1>
//       </div>

//       {/* Right side */}
//       <div className="w-1/2 flex items-center justify-center bg-gray-50">
//         <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
//           <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
//           {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium">Email</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded-lg"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Password</label>
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded-lg"
//                 required
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-lg"
//             >
//               Sign In
//             </button>
//           </form>

//           <p className="text-sm text-center mt-4">
//             Don’t have an account?{" "}
//             <a href="/register" className="text-purple-700 font-medium">
//               Register
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/app/login/page.tsx
// 'use client'; // Mark this as a Client Component

// import { useState } from 'react'; // Import useState for form state
// import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook
// import { useRouter } from 'next/navigation'; // Import useRouter for navigation
// import Button from '@/components/Button'; // Import the reusable Button component
// import TextField from '@/components/TextField'; // Import the reusable TextField component

// export default function LoginPage() {
//   const [email, setEmail] = useState(''); // State for email input
//   const [password, setPassword] = useState(''); // State for password input
//   const [error, setError] = useState(''); // State for error messages
//   const [isLoading, setIsLoading] = useState(false); // State for button loading status

//   const { login } = useAuth(); // Get the login function from context
//   const router = useRouter(); // Get the router instance

//   const handleSubmit = async (e: React.FormEvent) => { // Define the submit handler
//     e.preventDefault(); // Prevent default form submission behavior
//     setError(''); // Clear any previous errors
//     setIsLoading(true); // Set loading state

//     try {
//       await login(email, password); // Call the login function from context
//       router.push('/dashboard'); // Redirect to dashboard on success
//     } catch (err: any) {
//       console.error('Login error:', err); // Log the error for debugging
//       // Try to get a user-friendly error message from the backend response
//       const errorMessage = err.response?.data?.error || err.message || 'Login failed';
//       setError(errorMessage); // Set the error message to display
//     } finally {
//       setIsLoading(false); // Stop loading state regardless of success/error
//     }
//   };

//   return (
//     <>
//       <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
//         <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
//           <h2 className="text-2xl font-bold text-center mb-6">Login to HirePath</h2>
//           <form onSubmit={handleSubmit} className="space-y-4"> {/* Form with submit handler */}
//             {error && <p className="text-red-600 text-center">{error}</p>} {/* Display error if exists */}
//             <TextField
//               id="email"
//               label="Email Address"
//               type="email"
//               value={email} // Bind state to input value
//               onChange={(e) => setEmail(e.target.value)} // Update state on change
//               required
//               placeholder="you@example.com"
//             />
//             <TextField
//               id="password"
//               label="Password"
//               type="password"
//               value={password} // Bind state to input value
//               onChange={(e) => setPassword(e.target.value)} // Update state on change
//               required
//               placeholder="••••••••"
//             />
//             <Button
//               type="submit" // Make this button submit the form
//               variant="primary"
//               size="md"
//               isLoading={isLoading} // Pass loading state to button
//               className="w-full"
//               disabled={isLoading} // Disable button while loading
//             >
//               {isLoading ? 'Logging In...' : 'Login'} {/* Button text changes based on loading state */}
//             </Button>
//           </form>
//           <p className="mt-4 text-center text-sm text-gray-600">
//             Don't have an account?{' '}
//             <a href="/signup" className="text-green-600 hover:underline font-medium">
//               Sign Up
//             </a>
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }


// src/app/login/page.tsx
'use client'; // Mark this as a Client Component

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import TextField from '@/components/TextField';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Decorative Background */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Add subtle wave or abstract shapes if desired */}
        <div className="absolute inset-0 opacity-30">
          {/* You can add SVG paths or divs here for more complex backgrounds */}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">Welcome Back</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          </p>

          {error && <p className="text-red-600 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="bg-gray-50 border-gray-200 focus:border-indigo-500"
            />

            <div className="relative">
              <TextField
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'} // Toggle between text and password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-gray-50 border-gray-200 focus:border-indigo-500 pr-10" // Add padding for eye icon
              />
              {/* Eye Icon Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4h.01a2 2 0 000 4H10z" />
                    <path fillRule="evenodd" d="M.416 10C0 10 .017 10 0 10v.017C0 10.017.017 10.017.017 10.017V10C.017 10 .017 10 .017 10zm10 0a8 8 0 110-16 8 8 0 010 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.28 10.28a7 7 0 0113.44 0 7 7 0 01-13.44 0zM10 12a2 2 0 100-4h.01a2 2 0 000 4H10z" clipRule="evenodd" />
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a7 7 0 007-7H3a7 7 0 007 7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-4 bg-indigo-700 hover:bg-indigo-800 text-white"
            >
              {isLoading ? 'Logging In...' : 'LOGIN'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            You don't have an account yet?{' '}
            <a href="/signup" className="text-orange-500 hover:text-orange-600 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}