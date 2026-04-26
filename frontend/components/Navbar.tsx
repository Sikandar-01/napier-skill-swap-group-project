"use client";

import Link from "next/link";
import logo from "./assets/logo-3.png";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MessageSquare, LogOut, PlusCircle, User } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { useToast } from "@/app/context/ToastContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useRouter();
  const { showToast } = useToast();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItemClass = (path: string) =>
    `font-medium text-sm transition-colors duration-200 ${
      pathname === path
        ? "text-white border-b-2 border-white pb-1"
        : "text-gray-300 hover:text-gray-400"
    }`;

  const handleLogout = async () => {
    try {
      setIsSubmitting(true);
      const response = await apiFetch("/auth/logout", { method: "POST" });
      if (response.ok) {
        logout();
        showToast("Signed out.", "success");
        navigate.push("/login");
      } else {
        showToast(await getErrorMessage(response), "error");
      }
    } catch (err) {
      console.warn("Logout request failed", err);
      showToast("Server error, please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f2f3e] border-b border-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-15">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center pl-3 sm:pl-0 gap-1 sm:gap-2 group transition-all duration-300"
          >
            {/* Text Logo */}
            <div className="flex flex-col leading-none">
              <span className="text-white font-black text-lg sm:text-xl tracking-tight uppercase">
                Napier
              </span>
              <span className="text-gray-400 font-medium text-sm sm:text-base tracking-tight uppercase">
                Skillswap
              </span>
            </div>

            {/* Divider */}
            <div className="h-7 w-[2px] bg-white/20 hidden xs:block"></div>

            {/* Image Logo */}
            <img
              src={logo.src}
              alt="Edinburgh Napier University"
              className="h-10 sm:h-12 w-auto brightness-110 group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className={navItemClass("/")}>
              Home
            </Link>

            <Link href="/about" className={navItemClass("/about")}>
              About
            </Link>

            <Link href="/browse" className={navItemClass("/browse")}>
              Browse Services
            </Link>

            {!user ? (
              <>
                <Link href="/safety" className={navItemClass("/safety")}>
                  Safety & Guidelines
                </Link>

                { !loading && (<div className="flex items-center space-x-4 ml-4">
                  <Link
                    href="/login"
                    className="text-sm text-white hover:text-gray-400 font-medium transition-colors"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="px-4 py-1 border border-white text-white rounded-md font-medium hover:bg-white hover:text-black transition-all"
                  >
                    Register
                  </Link>
                </div>)
                }
              </>
            ) : (
              <>
                <Link
                  href="/post-service"
                  className="flex items-center space-x-1 text-gray-300 hover:text-white font-medium transition-colors"
                >
                  <PlusCircle size={18} />
                  <span>Post a Service</span>
                </Link>

                <Link
                  href="/profile"
                  className={`transition-colors ${
                    pathname === "/profile"
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                  title="Profile"
                  aria-label="Profile"
                >
                  <User size={22} strokeWidth={2} />
                </Link>

                <Link
                  href="/messages"
                  className="text-gray-300 hover:text-white transition-colors"
                  title="Messages"
                  aria-label="Messages"
                >
                  <MessageSquare size={22} />
                </Link>

                {!loading && (<button className="text-gray-300 hover:text-white transition-colors" 
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                </button>)}
              </>
            )}
          </div>

          {/* Mobile: profile shortcut + menu */}
          <div className="md:hidden flex items-center gap-1">
            {user && (
              <Link
                href="/profile"
                className={`p-2 rounded-lg transition-colors ${
                  pathname === "/profile"
                    ? "text-white bg-white/10"
                    : "text-white hover:text-gray-300 hover:bg-white/5"
                }`}
                title="Profile"
                aria-label="Profile"
              >
                <User size={22} strokeWidth={2} />
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 text-white hover:text-gray-400"
              type="button"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slider & Backdrop */}
      <div
        className={`fixed inset-0  z-50 md:hidden transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Slider Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-[75%] max-w-[300px] bg-[#0f2f3e] border-l border-black shadow-2xl transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center p-4 border-b border-white">
              <span className="text-white font-bold">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-white hover:bg-gray-900 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Links */}
            <div className="px-4 py-5 grow space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
                { name: "Browse Services", path: "/browse" },
                { name: "Safety & Guidelines", path: "/safety" },
              ].map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.path
                      ? "bg-white text-black"
                      : "text-gray-300 hover:bg-gray-900 hover:text-white border border-white "
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-5 mt-5 border-t border-gray-800 flex flex-col space-y-2.5">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2.5 bg-gray-900 text-white border border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/post-service"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg text-sm font-medium transition-colors"
                    >
                      <PlusCircle size={18} />
                      <span>Post a Service</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === "/profile"
                          ? "bg-white text-black"
                          : "text-gray-300 hover:text-white hover:bg-gray-900 border border-white"
                      }`}
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg text-sm font-medium transition-colors"
                    >
                      <MessageSquare size={18} />
                      <span>Messages</span>
                    </Link>
                    <button
                      className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-950/20 rounded-lg text-sm font-medium transition-colors w-full text-left"
                      onClick={() => handleLogout()}
                    >
                      <LogOut size={18} />
                      <span>Log Out</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
