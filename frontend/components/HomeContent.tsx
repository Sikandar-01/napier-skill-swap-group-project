"use client";

import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import RecentListings from "@/components/RecentListings";
import { useAuth } from "@/app/context/AuthContext";

export default function HomeContent() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Hero isLoggedIn={!!user} />
      <Categories />
      <RecentListings />
    </div>
  );
}
