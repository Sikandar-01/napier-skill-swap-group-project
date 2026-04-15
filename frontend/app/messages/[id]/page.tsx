"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import {
  fetchConversation,
  fetchMessages,
  sendMessage,
  type ConversationDetail,
  type MessageRow,
} from "@/lib/messaging";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id;
  const conversationId =
    typeof idParam === "string"
      ? parseInt(idParam, 10)
      : Array.isArray(idParam)
        ? parseInt(idParam[0] ?? "", 10)
        : NaN;

  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadThread = useCallback(async () => {
    if (!user || !Number.isFinite(conversationId)) return;
    setLoading(true);
    setPageError(null);
    try {
      const [d, msgs] = await Promise.all([
        fetchConversation(conversationId),
        fetchMessages(conversationId),
      ]);
      setDetail(d);
      setMessages(msgs);
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Could not load conversation.");
      setDetail(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user, conversationId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!Number.isFinite(conversationId)) {
      setPageError("Invalid conversation.");
      setLoading(false);
      return;
    }
    loadThread();
  }, [authLoading, user, router, conversationId, loadThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = reply.trim();
    if (!text || !Number.isFinite(conversationId)) return;
    try {
      setSending(true);
      const msg = await sendMessage(conversationId, text);
      setMessages((prev) => [...prev, msg]);
      setReply("");
      showToast("Message sent.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not send message.",
        "error",
      );
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black pt-24 text-gray-400">
        Loading…
      </div>
    );
  }

  if (!Number.isFinite(conversationId)) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 text-center text-gray-400">
        Invalid conversation.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black pt-24 text-gray-500">
        Loading conversation…
      </div>
    );
  }

  if (pageError || !detail) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4 text-center">
        <p className="text-red-400 mb-4">{pageError ?? "Not found."}</p>
        <Link href="/messages" className="text-blue-400 underline">
          Back to inbox
        </Link>
      </div>
    );
  }

  const isSeeker = user.id === detail.seeker_id;

  return (
    <div className="min-h-screen bg-black pt-20 pb-28 md:pb-12 flex flex-col">
      <div className="max-w-2xl w-full mx-auto px-4 flex-1 flex flex-col min-h-0">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Inbox
        </Link>

        <div className="rounded-t-xl border border-b-0 border-gray-800 bg-gray-900 px-4 py-3 shrink-0">
          <p className="text-xs text-gray-500 mb-0.5">Listing</p>
          <Link
            href={`/service/${detail.service_id}`}
            className="text-lg font-semibold text-white hover:text-[#fe295a] transition-colors"
          >
            {detail.service_title}
          </Link>
          <p className="text-sm text-gray-400 mt-1">
            {isSeeker ? "Provider" : "From"}:{" "}
            <span className="text-gray-300">
              {isSeeker ? detail.provider_name : detail.seeker_name}
            </span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-800 bg-gray-950/80 px-3 py-4 space-y-3 min-h-[200px] max-h-[calc(100vh-16rem)] md:max-h-[min(60vh,520px)]">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">
              No messages in this thread yet.
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === user.id;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      mine
                        ? "bg-[#0f2f3e] border border-gray-700 text-white"
                        : "bg-gray-800 border border-gray-700 text-gray-100"
                    }`}
                  >
                    {!mine && (
                      <p className="text-xs text-gray-500 mb-1">
                        {m.sender_name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {m.body}
                    </p>
                    <time
                      className="text-[10px] text-gray-500 mt-1 block text-right"
                      dateTime={m.created_at}
                    >
                      {format(new Date(m.created_at), "d MMM, HH:mm")}
                    </time>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="fixed bottom-0 left-0 right-0 md:static md:rounded-b-xl border border-t-0 md:border-t border-gray-800 bg-gray-900 p-3 flex gap-2 shrink-0"
        >
          <label htmlFor="reply" className="sr-only">
            Reply
          </label>
          <textarea
            id="reply"
            rows={2}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply…"
            className="flex-1 resize-none rounded-lg bg-black border border-gray-700 text-white text-sm px-3 py-2 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            className="self-end px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
