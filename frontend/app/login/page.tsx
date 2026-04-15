"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiFetch, getErrorMessage } from "@/lib/api";
import {
  clearLoginReminder,
  readLoginReminder,
  saveLoginReminder,
} from "@/lib/loginReminder";

const REMIND_DELAY_MS = 24 * 60 * 60 * 1000;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remindMe, setRemindMe] = useState(false);
  const navigate = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const data = readLoginReminder();
    if (data && Date.now() < data.fireAt) setRemindMe(true);
  }, []);

  const handleRemindMeChange = (checked: boolean) => {
    setRemindMe(checked);
    if (checked) {
      saveLoginReminder(Date.now() + REMIND_DELAY_MS);
      showToast(
        "Reminder set. When you return to this site after 24 hours, we will show you a notice here.",
        "success",
      );
    } else {
      clearLoginReminder();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login({
          id: data.id,
          name: data.name,
          email: data.email,
          is_admin: data.is_admin,
        });
        if (readLoginReminder()) clearLoginReminder();
        showToast("Signed in successfully.", "success");
        let dest = "/";
        if (typeof window !== "undefined") {
          const next = new URLSearchParams(window.location.search).get("next");
          if (next && next.startsWith("/") && !next.startsWith("//")) {
            dest = next;
          }
        }
        navigate.push(dest);
      } else {
        showToast(await getErrorMessage(response), "error");
      }
    } catch (err) {
      console.warn("Login request failed", err);
      showToast("Server error, please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-10 rounded-2xl shadow-sm border border-gray-800">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to access your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
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
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 bg-black border border-gray-800 placeholder-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent sm:text-sm transition-all"
                  placeholder="University Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 bg-black border border-gray-800 placeholder-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent sm:text-sm transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">

              <div className="text-sm shrink-0">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-800 bg-black/40 px-3 py-2.5">
              <input
                id="remind-me"
                name="remind-me"
                type="checkbox"
                checked={remindMe}
                onChange={(e) => handleRemindMeChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 text-white focus:ring-white border-gray-800 rounded bg-black"
              />
              <label htmlFor="remind-me" className="flex gap-2 text-sm text-gray-400 cursor-pointer">
                <Bell className="h-4 w-4 shrink-0 text-gray-500 mt-0.5" />
                <span>
                  <span className="text-gray-300 font-medium">Remind me</span>
                  <span className="block text-gray-500 text-xs mt-0.5">
                    Show an in-app reminder the next time you visit after 24 hours (stored only on this device).
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <button
              disabled={isSubmitting}
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all shadow-md"
            >
              Sign in
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-white hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
