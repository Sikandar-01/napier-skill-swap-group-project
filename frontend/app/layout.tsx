import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginReminderListener from "@/components/LoginReminderListener";
import { ServiceProvider } from "./context/ServiceContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

export const metadata: Metadata = {
  title: "Napier SkillSwap",
  description: "Connect with fellow Napier students for tutoring and skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="antialiased h-screen overflow-hidden flex flex-col bg-(--pk-gray-soft)">
        <AuthProvider>
          <ServiceProvider>
            <ToastProvider>
              <LoginReminderListener />
              <Navbar />
              <div className="flex-1 overflow-y-auto mt-15">
                <main className="grow">{children}</main>
                <Footer />
              </div>
            </ToastProvider>
          </ServiceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
