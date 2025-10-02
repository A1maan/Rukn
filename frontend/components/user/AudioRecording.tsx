"use client";

import { useState } from "react";
import { Mic, Square } from "lucide-react";

interface AudioRecordingProps {
  onBack: () => void;
}

export default function AudioRecording({ onBack }: AudioRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual audio recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    // TODO: Implement stop recording and send
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">تسجيل رسالة صوتية</h2>
          <p className="text-gray-600">Voice Message Recording</p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Recording Indicator */}
          <div className="relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-100 animate-pulse' : 'bg-amber-100'
            }`}>
              {isRecording ? (
                <Square className="w-16 h-16 text-red-600" />
              ) : (
                <Mic className="w-16 h-16 text-amber-600" />
              )}
            </div>
            {isRecording && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                Recording...
              </div>
            )}
          </div>

          {/* Timer */}
          {isRecording && (
            <div className="text-2xl font-mono text-gray-700">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-md">
            <p className="text-sm text-gray-600 mb-1">
              {isRecording ? 'اضغط للتوقف عن التسجيل' : 'اضغط لبدء التسجيل'}
            </p>
            <p className="text-xs text-gray-500">
              {isRecording ? 'Press to stop recording' : 'Press to start recording'}
            </p>
          </div>

          {/* Record/Stop Button */}
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`px-8 py-4 rounded-xl font-semibold text-white transition-all ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isRecording ? 'إيقاف وإرسال / Stop & Send' : 'بدء التسجيل / Start Recording'}
          </button>
        </div>
      </div>
    </div>
  );
}
