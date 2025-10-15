"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api"; // ✅ use shared API
import TextField from "@/components/TextField";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [email, setEmail] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/accounts/login/", {
        email: formData.email,
        password: formData.password,
      });

      // Save tokens
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side */}
      <div className="w-1/2 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center text-white rounded-tr-4xl rounded-br-4xl">
       
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
         <h1 className="text-3xl font-black text-center  text-[#7551FF]">HIRE<span className="text-[#130160]" >-PATH</span></h1>
          <h2 className="text-xl font-medium mb-6 text-gray-500 text-center">Reset Password</h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="bg-gray-50 border-gray-200 focus:border-indigo-500" />

            </div>
            <button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-lg"
            >
             Reset Password
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Go back to   {"   "}
            <a href="/login" className="text-purple-700 font-medium">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}