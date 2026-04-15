"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { useToast } from "../context/ToastContext";

export default function RegisterPage() {
  // Form state variables
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useRouter();
  const { showToast } = useToast();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      // Send POST request to backend register endpoint
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        showToast("Registration successful. You can now sign in.", "success");
        navigate.push("/login");
      } else {
        showToast(await getErrorMessage(response), "error");
      }
    } catch (err) {
      // Network / CORS / unexpected errors
      console.warn("Registration request failed", err);
      showToast("Server error, please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-10 rounded-2xl shadow-sm border border-gray-800">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Join the Napier SkillSwap community
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name input */}
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Full Name"
                  className="appearance-none rounded-lg w-full px-3 py-3 pl-10 bg-black border border-gray-800 placeholder-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white sm:text-sm transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email input */}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="University Email Address (@live.napier.ac.uk)"
                  className="appearance-none rounded-lg w-full px-3 py-3 pl-10 bg-black border border-gray-800 placeholder-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white sm:text-sm transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Password"
                  className="appearance-none rounded-lg w-full px-3 py-3 pl-10 bg-black border border-gray-800 placeholder-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white sm:text-sm transition-all"
                  value={password}
                  maxLength={72}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm password input */}
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Confirm Password"
                  className="appearance-none rounded-lg w-full px-3 py-3 pl-10 bg-black border border-gray-800 placeholder-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white sm:text-sm transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all shadow-md"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Redirect to login */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-white hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}