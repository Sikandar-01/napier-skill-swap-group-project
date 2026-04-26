"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

interface HeroProps {
  isLoggedIn?: boolean;
}

export default function Hero({ isLoggedIn = false }: HeroProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { showToast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      showToast("Type something to search for services.", "warning");
      return;
    }
    router.push(`/browse?q=${encodeURIComponent(q)}`);
  };

  const searchForm = (
    <form
      onSubmit={handleSearch}
      className="relative max-w-2xl mx-auto mb-8 shadow-sm w-full"
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-gray-500" aria-hidden />
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full pl-12 pr-[7.5rem] py-4 bg-gray-900 border border-gray-800 rounded-xl text-lg text-white focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder:text-gray-600"
        placeholder="Search services (e.g. Python tutoring, CV help…)"
        aria-label="Search services"
      />
      <button
        type="submit"
        className="absolute inset-y-2 right-2 px-6 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        Search
      </button>
    </form>
  );

  return (
    <div className="bg-black border-b border-gray-800 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-teal-500 opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
            <>
              <div className="inline-block mb-4 px-4 py-1.5 bg-gray-900 text-[#fe295a] rounded-full text-sm font-semibold tracking-wide border border-gray-800">
                Exclusive for Napier Students
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Find Help. Offer Skills.{" "}
                <span className="text-[#fe295a] block sm:inline mt-1 sm:mt-0">
                  Only for Napier.
                </span>
              </h1>
              <p className="text-xl md:text-1xl text-gray-400 mb-8 leading-relaxed">
                Connect with fellow students for tutoring, CV reviews, tech
                support, and more. A safe, trusted community built for your
                university journey.
              </p>

              {searchForm}

              <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full max-w-sm mx-auto sm:max-w-none">
                <Link
                  href="/browse"
                  className="flex-1 sm:flex-none sm:min-w-[200px] px-5 py-3.5 sm:px-8 sm:py-4 bg-white text-black rounded-xl font-bold text-sm sm:text-lg hover:bg-gray-200 transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search size={18} className="sm:w-6 sm:h-6" />
                  <span>Browse Services</span>
                </Link>

                <Link
                  href="/register"
                  className="flex-1 sm:flex-none sm:min-w-[200px] px-5 py-3.5 sm:px-8 sm:py-4 bg-transparent text-white border-2 border-white/20 rounded-xl font-bold text-sm sm:text-lg hover:bg-white hover:text-black hover:border-white transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
                >
                  Join Community
                </Link>
              </div>
            </>
          
        </div>
      </div>
    </div>
  );
}
