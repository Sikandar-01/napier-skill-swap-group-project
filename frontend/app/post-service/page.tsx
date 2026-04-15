"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, DollarSign, Tag, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { categoryPlaceholderImages } from "../context/ServiceContext";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { useToast } from "../context/ToastContext";

export default function PostServicePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const image =
      (category && categoryPlaceholderImages[category]) ||
      categoryPlaceholderImages.Other;
    try {
      setIsSubmitting(true);
      const res = await apiFetch("/services/", {
        method: "POST",
        body: JSON.stringify({
          title,
          category,
          price,
          description: description || null,
          contact_number: null,
          image,
        }),
      });
      if (!res.ok) {
        showToast(await getErrorMessage(res), "error");
        return;
      }
      showToast("Service posted successfully.", "success");
      router.push("/browse");
    } catch {
      showToast("Server error, please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--pk-gray-soft] pt-24 text-[--secondary]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--pk-gray-soft] pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[--secondary] mb-8">
          Post a New Service
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[--pk-red] focus:border-transparent outline-none transition-all"
                placeholder="e.g., Expert Python Tutoring for Beginners"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <Tag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[--pk-red] focus:border-transparent outline-none transition-all appearance-none bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="Tutoring">Tutoring</option>
                  <option value="CV & Careers">CV & Careers</option>
                  <option value="Tech Help">Tech Help</option>
                  <option value="Design">Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[--pk-red] focus:border-transparent outline-none transition-all"
                  placeholder="e.g., £15/hr or £20 fixed"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <FileText
                  className="absolute left-3 top-4 text-gray-400"
                  size={18}
                />
                <textarea
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[--pk-red] focus:border-transparent outline-none transition-all min-h-[150px]"
                  placeholder="Describe your service in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-[--pk-red]">
                    Category default image
                  </span>{" "}
                  is used until image upload is supported.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[--pk-red] text-white px-8 py-3 rounded-lg font-medium hover:bg-[--pk-red-hover] transition-colors shadow-sm disabled:opacity-60"
            >
              {isSubmitting ? "Posting…" : "Post Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
