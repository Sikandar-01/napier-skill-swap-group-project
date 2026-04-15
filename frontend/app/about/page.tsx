"use client";
import React, { use } from "react";
import {
  Users,
  Lightbulb,
  Shield,
  GraduationCap,
  Heart,
  Zap,
  Search,
} from "lucide-react";
import Link from "next/link";
import {useAuth} from "@/app/context/AuthContext";

export default function AboutPage() {
  const {user} = useAuth();

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-1.5 bg-gray-900 text-[#fe295a] rounded-full text-sm font-semibold tracking-wide border border-gray-800">
            About Napier SkillSwap
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Empowering Students Through <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fe295a] to-[#ff5e7e]">
              Shared Knowledge
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Napier SkillSwap is a community-driven platform built exclusively
            for Edinburgh Napier University students. We believe that every
            student has a skill to share and every student has something to
            learn.
          </p>
        </div>

        {/* Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-[#0f2f3e] p-8 rounded-2xl border border-white/10 hover:border-[#fe295a]/50 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#fe295a]/20 transition-colors">
              <Users className="text-[#fe295a]" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">
              By Students, For Students
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Tailored specifically for the Napier community, ensuring a safe
              and relevant environment for all campus locations.
            </p>
          </div>

          <div className="bg-[#0f2f3e] p-8 rounded-2xl border border-white/10 hover:border-[#fe295a]/50 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#fe295a]/20 transition-colors">
              <Zap className="text-[#fe295a]" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">Skill Exchange</h3>
            <p className="text-gray-400 leading-relaxed">
              From Python coding to CV proofreading, or even music lessons -
              discover the diverse talents of your peers.
            </p>
          </div>

          <div className="bg-[#0f2f3e] p-8 rounded-2xl border border-white/10 hover:border-[#fe295a]/50 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#fe295a]/20 transition-colors">
              <Shield className="text-[#fe295a]" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">Trusted Environment</h3>
            <p className="text-gray-400 leading-relaxed">
              A verified community where you can connect with confidence,
              knowing you're dealing with fellow matriculated students.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-gradient-to-b from-[#0a0a0a] to-black rounded-3xl p-8 md:p-16 border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Lightbulb className="text-[#fe295a]" />
                Why SkillSwap?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-[#fe295a]/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#fe295a]"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      Cost Effective
                    </h4>
                    <p className="text-gray-400">
                      Save money on expensive professional services by trading
                      skills or finding affordable student rates.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-[#fe295a]/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#fe295a]"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      Portfolio Building
                    </h4>
                    <p className="text-gray-400">
                      Gain real experience by offering your skills, helping you
                      build a stronger CV for future employment.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-[#fe295a]/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#fe295a]"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Networking</h4>
                    <p className="text-gray-400">
                      Connect with students outside your own course and campus,
                      fostering cross-disciplinary collaboration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Ready to join the community?
          </h2>

          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full max-w-sm mx-auto sm:max-w-none">
            { !user && (<Link
              href="/register"
              className="flex-1 sm:flex-none sm:min-w-[200px] px-5 py-3.5 sm:px-8 sm:py-4 bg-[#fe295a] hover:bg-[#e0244e] text-white rounded-xl font-bold text-sm sm:text-lg transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {/* <Search size={18} className="sm:w-6 sm:h-6" /> */}
              <span> Create your account</span>
            </Link>
            )}
            <Link
              href="/browse"
              className="flex-1 sm:flex-none sm:min-w-[200px] px-5 py-3.5 sm:px-8 sm:py-4 bg-transparent text-white border-2 border-white/20 rounded-xl font-bold text-sm sm:text-lg hover:bg-white hover:text-black hover:border-white transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
            >
              Join Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
