"use client";

import ServiceCard from "./ServiceCard";
import Link from "next/link";
import { useService } from "../app/context/ServiceContext";

export default function RecentListings() {
  const { services, loading } = useService();

  // Sort by createdAt descending and take the first 4
  const recentServices = [...services]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div className="max-w-xs sm:max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              Recent Services
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              See what's being offered right now.
            </p>
          </div>
          <Link
            href="/browse"
            className="hidden sm:inline-block px-5 py-2.5 bg-gray-900 border border-gray-800 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            View All Services
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading && recentServices.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-8">
              Loading recent services…
            </p>
          ) : recentServices.length > 0 ? (
            recentServices.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No recent services found.
            </p>
          )}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/browse"
            className="inline-block px-6 py-3 bg-gray-900 border border-gray-800 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors w-full"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
