"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/app/context/ToastContext";
import {
  clearLoginReminder,
  readLoginReminder,
} from "@/lib/loginReminder";

/**
 * When the user enables "Remind me" on the login page, a future timestamp is stored.
 * On any visit after that time, show a custom in-app notice once.
 */
export default function LoginReminderListener() {
  const { showToast } = useToast();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    const data = readLoginReminder();
    if (!data || Date.now() < data.fireAt) return;
    fired.current = true;
    clearLoginReminder();
    showToast(
      "You asked for a reminder — welcome back. Sign in when you are ready.",
      "info",
    );
  }, [showToast]);

  return null;
}
