"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Service,
  ServiceApi,
  mapServiceFromApi,
} from "@/app/context/ServiceContext";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { startConversation } from "@/lib/messaging";

function ServiceDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const id = String(params.id ?? "");
  const serviceIdNum = parseInt(id, 10);

  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactBody, setContactBody] = useState("");
  const [sending, setSending] = useState(false);
  const contactQueryHandled = useRef<string | null>(null);
  const contactLoginRedirectSent = useRef(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/services/${id}`);
        if (cancelled) return;
        if (!res.ok) {
          setError(await getErrorMessage(res));
          setService(null);
          return;
        }
        const data: ServiceApi = await res.json();
        setService(mapServiceFromApi(data));
      } catch {
        if (!cancelled) {
          setError("Could not load this service.");
          setService(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    contactQueryHandled.current = null;
    contactLoginRedirectSent.current = false;
  }, [id]);

  const isOwner =
    !authLoading &&
    user != null &&
    service != null &&
    user.id === service.ownerId;

  useEffect(() => {
    if (searchParams.get("contact") !== "1" || !service || authLoading) return;

    if (!user) {
      if (contactLoginRedirectSent.current) return;
      contactLoginRedirectSent.current = true;
      router.push(
        `/login?next=${encodeURIComponent(`/service/${id}?contact=1`)}`,
      );
      return;
    }

    const mark = `${id}:contact-open`;
    if (contactQueryHandled.current === mark) return;
    contactQueryHandled.current = mark;

    if (user.id === service.ownerId) {
      router.replace(`/service/${id}`, { scroll: false });
      return;
    }

    setContactOpen(true);
    router.replace(`/service/${id}`, { scroll: false });
  }, [searchParams, service, authLoading, user, id, router]);

  const openContact = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/service/${id}?contact=1`)}`);
      return;
    }
    if (isOwner) {
      showToast("This is your own listing.", "info");
      return;
    }
    setContactOpen(true);
  };

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = contactBody.trim();
    if (!body || !Number.isFinite(serviceIdNum)) return;
    try {
      setSending(true);
      const conv = await startConversation(serviceIdNum, body);
      showToast("Message sent.", "success");
      setContactOpen(false);
      setContactBody("");
      router.push(`/messages/${conv.id}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not send message.",
        "error",
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4 text-center">
        <p className="text-red-400 mb-4">{error ?? "Not found."}</p>
        <Link href="/browse" className="text-blue-400 underline">
          Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/browse"
          className="text-sm text-blue-400 hover:underline mb-6 inline-block"
        >
          ← Back to browse
        </Link>
        <img
          src={service.image}
          alt=""
          className="w-full h-64 object-cover rounded-xl mb-6 border border-gray-800"
        />
        <h1 className="text-3xl font-bold text-white mb-2">{service.title}</h1>
        <p className="text-gray-400 mb-4">
          {service.category} · {service.price}
        </p>
        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
          {service.description || "No description provided."}
        </p>
        <p className="text-gray-500 mt-8 text-sm">Posted by {service.author}</p>

        <div className="mt-8 flex flex-wrap gap-3 items-center">
          {authLoading ? (
            <span className="text-sm text-gray-500">Checking session…</span>
          ) : !isOwner ? (
            <button
              type="button"
              onClick={openContact}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-3 font-semibold hover:bg-gray-200 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Contact
            </button>
          ) : null}
          {!authLoading && user && isOwner && (
            <p className="text-sm text-gray-500">
              This is your listing — seekers can contact you from here.
            </p>
          )}
          {!authLoading && !user && (
            <p className="text-sm text-gray-500">
              Sign in to message the provider on the platform.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {contactOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Message {service.author}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[240px] sm:max-w-md">
                    Re: {service.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSendContact} className="p-5 space-y-4">
                <label className="block text-sm text-gray-400">
                  Your message
                  <textarea
                    required
                    rows={5}
                    value={contactBody}
                    onChange={(e) => setContactBody(e.target.value)}
                    className="mt-2 w-full rounded-lg bg-black border border-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Introduce yourself and what you need help with…"
                    maxLength={8000}
                    disabled={sending}
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setContactOpen(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !contactBody.trim()}
                    className="px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Send message"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ServiceDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black pt-24 flex items-center justify-center text-gray-500">
          Loading…
        </div>
      }
    >
      <ServiceDetailContent />
    </Suspense>
  );
}
