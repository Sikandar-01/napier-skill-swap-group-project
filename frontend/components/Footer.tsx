import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0b252c] border-t-4 border-[#fe2959] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Mission */}
          <div>
            <h3 className="text-xl font-bold text-[#fe2959] mb-4">
              Napier SkillSwap
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              A student-to-student platform for sharing skills, finding tutors,
              and helping each other succeed at Napier University.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/browse"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Browse Services
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Safety & Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer / Trust */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-4">Trust & Safety</h4>
            <div className="flex items-start space-x-3 text-sm text-gray-400">
              <ShieldCheck className="w-5 h-5 text-[#fe2959] flex-shrink-0 mt-0.5" />
              <p>
                Napier SkillSwap does not process payments. All arrangements are
                made privately between students.
              </p>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Napier Students Only • No Scams • No Fees
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Napier SkillSwap Project.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
