"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  fetchConversations,
  type ConversationSummary,
} from "@/lib/messaging";

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    setLoadError(null);
    try {
      const data = await fetchConversations();
      setItems(data);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load inbox.");
      setItems([]);
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    load();
  }, [loading, user, router, load]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black pt-24 text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          <Link
            href="/browse"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Browse listings
          </Link>
        </div>

        {loadError && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-200 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => {
                showToast("Retrying…", "info");
                load();
              }}
              className="text-left sm:text-right underline decoration-red-400"
            >
              Retry
            </button>
          </div>
        )}

        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          {listLoading ? (
            <div className="py-16 text-center text-gray-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-600 mb-4" />
              <p className="text-gray-400 text-sm mb-2">No conversations yet.</p>
              <p className="text-gray-500 text-xs mb-6">
                Open a listing and use <strong className="text-gray-400">Contact</strong>{" "}
                to message the provider.
              </p>
              <Link
                href="/browse"
                className="inline-block text-sm font-medium text-white underline underline-offset-2"
              >
                Browse services
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {items.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/messages/${c.id}`}
                    className="block px-5 py-4 hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex justify-between gap-3 mb-1">
                      <span className="font-medium text-white truncate">
                        {c.other_party_name}
                      </span>
                      <time
                        className="shrink-0 text-xs text-gray-500 tabular-nums"
                        dateTime={c.last_message_at}
                        suppressHydrationWarning
                      >
                        {formatDistanceToNow(new Date(c.last_message_at), {
                          addSuffix: true,
                        })}
                      </time>
                    </div>
                    <p className="text-sm text-[#fe295a]/90 font-medium truncate mb-0.5">
                      {c.service_title}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {c.last_message_preview || "No messages yet."}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
