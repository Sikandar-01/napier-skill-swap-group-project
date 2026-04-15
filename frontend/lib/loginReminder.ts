export const LOGIN_REMINDER_KEY = "skillswap_login_reminder";

export type LoginReminderPayload = {
  fireAt: number;
};

export function readLoginReminder(): LoginReminderPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOGIN_REMINDER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as LoginReminderPayload;
    if (typeof data.fireAt !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

export function saveLoginReminder(fireAt: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    LOGIN_REMINDER_KEY,
    JSON.stringify({ fireAt } satisfies LoginReminderPayload),
  );
}

export function clearLoginReminder() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOGIN_REMINDER_KEY);
}
