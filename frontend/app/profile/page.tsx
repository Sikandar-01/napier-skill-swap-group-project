"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, MessageSquare, ListOrdered } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Service,
  mapServiceFromApi,
  ServiceApi,
} from "../context/ServiceContext";
import { apiFetch, getErrorMessage } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Service[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) {
      setListings([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setListLoading(true);
      setListError(null);
      try {
        const res = await apiFetch("/services/me");
        if (cancelled) return;
        if (!res.ok) {
          setListError(await getErrorMessage(res));
          setListings([]);
          return;
        }
        const data: ServiceApi[] = await res.json();
        setListings(data.map(mapServiceFromApi));
      } catch {
        if (!cancelled) {
          setListError("Could not load your listings.");
          setListings([]);
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black pt-24 text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-2xl font-bold text-white">Your profile</h1>

        <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-gray-800">
              <User className="h-7 w-7 text-gray-400" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-lg font-semibold text-white">{user.name}</p>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                {user.email}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-800 px-6 py-4">
            <ListOrdered className="h-5 w-5 text-gray-400" aria-hidden />
            <h2 className="text-lg font-bold text-white">My Listings</h2>
          </div>
          {listError && (
            <p className="px-6 py-4 text-sm text-red-400 border-b border-gray-800">
              {listError}
            </p>
          )}
          <div className="divide-y divide-gray-800">
            {listLoading ? (
              <div className="px-6 py-10 text-center text-gray-500">Loading…</div>
            ) : listings.length > 0 ? (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/service/${listing.id}`}
                      className="font-medium text-white hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {listing.category} · {listing.price}
                    </p>
                  </div>
                  <Link
                    href="/browse"
                    className="text-sm text-gray-400 hover:text-white shrink-0"
                  >
                    Manage on Browse
                  </Link>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-gray-500">
                You have no listings yet.{" "}
                <Link href="/post-service" className="text-white underline">
                  Post a service
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-800 px-6 py-4">
            <MessageSquare className="h-5 w-5 text-gray-400" aria-hidden />
            <h2 className="text-lg font-bold text-white">My Messages</h2>
          </div>
          <div className="px-6 py-8 text-center text-gray-500 text-sm leading-relaxed">
            <p className="mb-4">
              View conversations you started from listings or replies from
              students contacting you.
            </p>
            <Link
              href="/messages"
              className="inline-flex items-center justify-center rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Open inbox
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
