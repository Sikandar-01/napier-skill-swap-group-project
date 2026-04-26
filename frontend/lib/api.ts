export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
}

export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: { msg?: string }) => item.msg ?? JSON.stringify(item))
        .join(", ");
    }
    if (typeof data.detail === "string") {
      return data.detail;
    }
  } catch {
    /* ignore */
  }
  return "Something went wrong.";
}
