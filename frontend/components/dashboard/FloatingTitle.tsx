"use client";

export default function FloatingTitle() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-md border-2 border-amber-400 rounded-xl px-6 py-3 shadow-xl">
      <h1 className="text-lg font-bold text-gray-800 text-center">
        NCMH Early Warning Dashboard
      </h1>
      <p className="text-xs text-gray-600 text-center mt-0.5">
        Real-time mental health helpline monitoring
      </p>
    </div>
  );
}
