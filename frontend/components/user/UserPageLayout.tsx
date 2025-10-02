"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";

interface UserPageLayoutProps {
  children: React.ReactNode;
}

export default function UserPageLayout({ children }: UserPageLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #F5F3EF 0%, #E8E6E1 100%)"
    }}>
      {/* Background pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.03 }}>
        <defs>
          <pattern id="user-crosshatch" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="20" y2="20" stroke="#8B7355" strokeWidth="0.5" />
            <line x1="20" y1="0" x2="0" y2="20" stroke="#8B7355" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#user-crosshatch)" />
      </svg>

      {/* Dashboard Button */}
      <Link
        href="/"
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm border-2 border-amber-300 text-gray-700 hover:bg-amber-50 hover:border-amber-400 transition-all shadow-md"
        title="Back to Dashboard"
      >
        <BarChart3 className="w-4 h-4" />
        <span className="text-sm font-medium">Dashboard</span>
      </Link>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-6">
        <div className="max-w-4xl mx-auto px-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">مركز الدعم النفسي</h1>
            <p className="text-gray-600">National Center for Mental Health Support</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {children}
      </div>
    </div>
  );
}
