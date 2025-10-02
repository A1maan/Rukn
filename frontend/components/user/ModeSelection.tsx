"use client";

import { Mic, MessageSquare } from "lucide-react";

interface ModeSelectionProps {
  onSelectMode: (mode: "audio" | "message") => void;
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">كيف تود التواصل معنا؟</h2>
        <p className="text-lg text-gray-600">How would you like to connect with us?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Audio Recording Option */}
        <button
          onClick={() => onSelectMode("audio")}
          className="group relative bg-white/85 backdrop-blur-md rounded-2xl border-2 border-amber-300 p-8 hover:bg-white/95 hover:border-amber-400 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Mic className="w-10 h-10 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">تسجيل صوتي</h3>
              <p className="text-sm text-gray-600 mb-1">Voice Recording</p>
              <p className="text-xs text-gray-500 mt-3">
                سجل رسالة صوتية وسنتواصل معك قريباً
              </p>
              <p className="text-xs text-gray-500">
                Record a voice message and we'll get back to you soon
              </p>
            </div>
          </div>
        </button>

        {/* Text Message Option */}
        <button
          onClick={() => onSelectMode("message")}
          className="group relative bg-white/85 backdrop-blur-md rounded-2xl border-2 border-amber-300 p-8 hover:bg-white/95 hover:border-amber-400 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <MessageSquare className="w-10 h-10 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">رسالة نصية</h3>
              <p className="text-sm text-gray-600 mb-1">Text Message</p>
              <p className="text-xs text-gray-500 mt-3">
                اكتب رسالة وسنرد عليك في أقرب وقت
              </p>
              <p className="text-xs text-gray-500">
                Write a message and we'll respond as soon as possible
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-200 p-6">
        <p className="text-center text-sm text-gray-600">
          <span className="font-semibold text-gray-700">خصوصيتك مهمة لنا</span> - جميع المحادثات سرية ومشفرة
        </p>
        <p className="text-center text-xs text-gray-500 mt-1">
          Your privacy matters to us - All conversations are confidential and encrypted
        </p>
      </div>
    </div>
  );
}
