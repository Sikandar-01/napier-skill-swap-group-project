import { apiFetch, getErrorMessage } from "@/lib/api";

export type ConversationSummary = {
  id: number;
  service_id: number;
  service_title: string;
  seeker_id: number;
  seeker_name: string;
  provider_id: number;
  provider_name: string;
  other_party_name: string;
  last_message_preview: string;
  last_message_at: string;
};

export type ConversationDetail = {
  id: number;
  service_id: number;
  service_title: string;
  seeker_id: number;
  seeker_name: string;
  provider_id: number;
  provider_name: string;
};

export type MessageRow = {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  body: string;
  created_at: string;
};

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await apiFetch("/conversations/");
  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }
  return res.json();
}

export async function fetchConversation(
  id: number,
): Promise<ConversationDetail> {
  const res = await apiFetch(`/conversations/${id}`);
  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }
  return res.json();
}

export async function fetchMessages(
  conversationId: number,
): Promise<MessageRow[]> {
  const res = await apiFetch(`/conversations/${conversationId}/messages`);
  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }
  return res.json();
}

export async function startConversation(
  serviceId: number,
  body: string,
): Promise<ConversationDetail> {
  const res = await apiFetch("/conversations/start", {
    method: "POST",
    body: JSON.stringify({ service_id: serviceId, body }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }
  return res.json();
}

export async function sendMessage(
  conversationId: number,
  body: string,
): Promise<MessageRow> {
  const res = await apiFetch(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }
  return res.json();
}
