// src/components/Navbar.tsx
'use client'; // Mark this as a Client Component

import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import Link from 'next/link'; // Import Link for client-side navigation

export default function Navbar() {
  const { user, logout } = useAuth(); // Get user data and logout function from context
  const router = useRouter(); // Get the router instance

  const handleLogout = () => {
    logout(); // Call the logout function from context
    router.push('/'); // Redirect to home page after logout
  };

  return (
    <nav className="bg-green-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">HirePath</Link>
        <div className="flex items-center space-x-4">
          {/* Navigation links for unauthenticated users */}
          {!user && (
            <>
              <Link href="/jobs" className="hover:underline">Jobs</Link>
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/signup" className="hover:underline">Sign Up</Link>
            </>
          )}
          {/* Navigation links for authenticated users */}
          {user && (
            <>
              <span className="text-sm">Hello, {user.email}</span>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}