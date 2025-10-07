"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import RegionSelector from "./RegionSelector";

interface TextMessageProps {
  onBack: () => void;
}

export default function TextMessage({ onBack }: TextMessageProps) {
  const [message, setMessage] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showRegionError, setShowRegionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const emotionTranslations: Record<string, string> = {
    'anger': 'غضب',
    'fear': 'خوف',
    'sadness': 'حزن',
    'happiness': 'سعادة',
    'surprise': 'مفاجأة',
    'neutral': 'محايد',
    'disgust': 'اشمئزاز',
    'anticipation': 'ترقب',
    'optimism': 'تفاؤل',
    'pessimism': 'تشاؤم',
    'confusion': 'حيرة'
  };

  const urgencyTranslations: Record<string, string> = {
    'high': 'عالية',
    'medium': 'متوسطة',
    'low': 'منخفضة'
  };

  const formatEmotion = (emotion: string) => {
    // Capitalize first letter of each word
    return emotion.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatTopic = (topic: string) => {
    // Replace underscores with spaces and capitalize
    return topic.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleClose = () => {
    setMessage("");
    setSelectedRegion("");
    setShowRegionError(false);
    setIsSubmitted(false);
    setAnalysisResult(null);
    onBack();
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Validate region selection
    if (!selectedRegion) {
      setShowRegionError(true);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Submit to backend for analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          region: selectedRegion,
          channel: 'chat', // or 'survey' based on context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit message');
      }

      const result = await response.json();
      console.log('Text analysis result:', result);
      
      // Show success state with analysis results (if available)
      if (result.analysis) {
        setAnalysisResult(result.analysis);
      }
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
      >
        ← العودة / Back
      </button>

      <div className="bg-white/85 backdrop-blur-md rounded-2xl border-2 border-amber-300 p-8 shadow-lg relative">
        {/* Processing Overlay */}
              {/* Processing Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">جاري المعالجة... / Processing...</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isSubmitted && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center z-20 rounded-lg p-8">
          <div className="text-center text-white max-w-md w-full">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <p className="text-2xl font-bold mb-2">تم الإرسال بنجاح</p>
            <p className="text-xl mb-6">Successfully Submitted</p>
            
            {/* Analysis Results - only show if available */}
            {analysisResult ? (
              <>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 space-y-3 mb-6">
                  <div className="flex justify-between items-center border-b border-white/30 pb-3">
                    <span className="font-semibold text-left">العاطفة<br/><span className="text-sm opacity-90">Emotion</span></span>
                    <span className="bg-white/30 px-4 py-2 rounded-full text-right">
                      <div>{emotionTranslations[analysisResult.emotion] || formatEmotion(analysisResult.emotion)}</div>
                      <div className="text-sm opacity-90">{formatEmotion(analysisResult.emotion)}</div>
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/30 pb-3">
                    <span className="font-semibold text-left">الأولوية<br/><span className="text-sm opacity-90">Urgency</span></span>
                    <span className={`px-4 py-2 rounded-full text-right ${
                      analysisResult.urgency === 'high' ? 'bg-red-500/90' :
                      analysisResult.urgency === 'medium' ? 'bg-amber-500/90' :
                      'bg-green-600/90'
                    }`}>
                      <div>{urgencyTranslations[analysisResult.urgency]}</div>
                      <div className="text-sm opacity-90 capitalize">{analysisResult.urgency}</div>
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/30 pb-3">
                    <span className="font-semibold text-left">الموضوع<br/><span className="text-sm opacity-90">Topic</span></span>
                    <span className="bg-white/30 px-4 py-2 rounded-full text-sm text-right">
                      {formatTopic(analysisResult.topic)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-left">الدقة<br/><span className="text-sm opacity-90">Confidence</span></span>
                    <span className="bg-white/30 px-4 py-2 rounded-full font-bold">
                      {(analysisResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-semibold transition-all border-2 border-white/40"
                >
                  حسناً / OK
                </button>
              </>
            ) : (
              <>
                <p className="text-sm mb-6 opacity-90">
                  تم استلام طلبك وسيتم الرد عليه قريباً<br />
                  Your request has been received and will be processed soon
                </p>
                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-semibold transition-all border-2 border-white/40"
                >
                  حسناً / OK
                </button>
              </>
            )}
          </div>
        </div>
      )}

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">إرسال رسالة نصية</h2>
          <p className="text-gray-600">Send a Text Message</p>
        </div>

        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

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
            disabled={!message.trim() || isSubmitting}
            className="w-full px-8 py-4 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                معالجة... / Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                إرسال / Send Message
              </>
            )}
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
