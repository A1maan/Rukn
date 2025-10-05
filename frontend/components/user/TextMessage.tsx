"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import RegionSelector from "./RegionSelector";

interface TextMessageProps {
  onBack: () => void;
}

export default function TextMessage({ onBack }: TextMessageProps) {
  const [message, setMessage] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showRegionError, setShowRegionError] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Validate region selection
    if (!selectedRegion) {
      setShowRegionError(true);
      return;
    }

    // TODO: Implement message sending with region
    console.log("Sending message:", message);
    console.log("Region:", selectedRegion);
    alert(`Message submitted for region: ${selectedRegion}\n(Backend integration pending)`);
    
    // Reset form
    setMessage("");
    setSelectedRegion("");
    setShowRegionError(false);
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
      >
        ← العودة / Back
      </button>

      <div className="bg-white/85 backdrop-blur-md rounded-2xl border-2 border-amber-300 p-8 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">إرسال رسالة نصية</h2>
          <p className="text-gray-600">Send a Text Message</p>
        </div>

        <div className="space-y-6">
          {/* Region Selector */}
          <RegionSelector 
            selectedRegion={selectedRegion}
            onRegionChange={(region) => {
              setSelectedRegion(region);
              setShowRegionError(false);
            }}
          />
          
          {showRegionError && !selectedRegion && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                ⚠️ يرجى اختيار المنطقة قبل الإرسال / Please select your region before submitting
              </p>
            </div>
          )}

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رسالتك / Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا... / Type your message here..."
              className="w-full h-48 px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none resize-none"
              dir="auto"
            />
            <p className="text-xs text-gray-500 mt-2">
              {message.length} / 1000 characters
            </p>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="w-full px-8 py-4 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            إرسال / Send Message
          </button>

          {/* Privacy Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center">
              سيتم الرد على رسالتك خلال 24 ساعة
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              You will receive a response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
