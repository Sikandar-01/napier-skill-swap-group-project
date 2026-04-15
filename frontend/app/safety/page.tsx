"use client";

import { Shield, AlertTriangle, CheckCircle, Lock } from "lucide-react";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Safety & Guidelines
          </h1>
          <p className="text-xl text-gray-400">
            Our commitment to keeping the Napier SkillSwap community safe and
            trusted.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-sm transition-all hover:border-gray-700">
            <div className="w-12 h-12 bg-blue-950/50 border border-blue-900/50 rounded-full flex items-center justify-center mb-6">
              <Shield className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Verified Students
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Only students with a valid Edinburgh Napier University email
              address can register and post services, ensuring a trusted
              community.
            </p>
          </div>

          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-sm transition-all hover:border-gray-700">
            <div className="w-12 h-12 bg-green-950/50 border border-green-900/50 rounded-full flex items-center justify-center mb-6">
              <Lock className="text-green-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Secure Communication
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Use our built-in messaging system to communicate. We recommend
              avoiding sharing personal phone numbers or external chat links
              initially.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CheckCircle className="text-teal-500 mr-3" />
              Community Guidelines
            </h2>
            <div className="space-y-4 text-gray-400">
              <p>
                <strong className="text-white">Be Respectful:</strong> Treat all
                members with respect and professional courtesy. Harassment or
                abusive language is not tolerated.
              </p>
              <p>
                <strong className="text-white">Honesty is Key:</strong> Be
                accurate in your service descriptions and fair in your pricing.
              </p>
              <p>
                <strong className="text-white">Deliver on Promises:</strong> If
                you agree to provide a service, ensure you deliver it to the
                best of your ability and on time.
              </p>
            </div>
          </section>

          {/* <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <AlertTriangle className="text-amber-500 mr-3" />
              Reporting Issues
            </h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              If you encounter any suspicious activity, inappropriate behavior,
              or issues with a service, please report it immediately.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Report an Issue
            </button>
          </section> */}
        </div>
      </div>
    </div>
  );
}
