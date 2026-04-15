"use client";

import {
  BookOpen,
  Briefcase,
  Cpu,
  Palette,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";

export default function Categories() {
  const categories = [
    {
      name: "Tutoring",
      icon: <BookOpen size={24} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      name: "CV & Careers",
      icon: <Briefcase size={24} />,
      color: "bg-green-50 text-green-600",
    },
    {
      name: "Tech Help",
      icon: <Cpu size={24} />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      name: "Design",
      icon: <Palette size={24} />,
      color: "bg-pink-50 text-pink-600",
    },
    {
      name: "Other",
      icon: <MoreHorizontal size={24} />,
      color: "bg-gray-100 text-gray-600",
    },
  ];

  return (
    <section className="py-16 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-2 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Browse by Category
          </h2>
          <Link
            href="/browse"
            className="text-gray-400 font-medium hover:text-white hover:underline text-xs sm:text-sm transition-colors"
          >
            See all categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat, idx) => (
            <Link
              href={`/browse?category=${cat.name}`}
              key={idx}
              className="bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-800 shadow-sm hover:shadow-md hover:border-white transition-all flex flex-col items-center justify-center text-center group"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 ${cat.color} group-hover:scale-110 transition-transform`}
              >
                {cat.icon}
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-200 group-hover:text-white transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
