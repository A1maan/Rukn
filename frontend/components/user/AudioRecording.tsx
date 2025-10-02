"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, RotateCcw, Send } from "lucide-react";

interface AudioRecordingProps {
  onBack: () => void;
}

export default function AudioRecording({ onBack }: AudioRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MAX_RECORDING_TIME = 600; // 5 minutes in seconds

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioURL]);

  const handleStartRecording = async () => {
    try {
      setError("");
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser doesn't support audio recording");
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        
        // Create URL for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          
          // Auto-stop at max time
          if (newTime >= MAX_RECORDING_TIME) {
            handleStopRecording();
          }
          
          return newTime;
        });
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access to record.");
      } else {
        setError("Failed to start recording. Please check your microphone.");
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
  };

  const handleReRecord = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL("");
    setRecordingTime(0);
    setIsPlaying(false);
    setError("");
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;

    // TODO: Implement backend submission
    console.log("Submitting audio blob:", audioBlob);
    alert("Recording submitted! (Backend integration pending)");
    
    // Reset after submission
    handleReRecord();
    onBack();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">{error}</p>
          </div>
        )}

        {!audioBlob ? (
          // Recording Interface
          <div className="flex flex-col items-center space-y-6">
            {/* Recording Indicator */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
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
            <div className="text-2xl font-mono text-gray-700">
              {formatTime(recordingTime)}
            </div>

            {/* Max time warning */}
            {isRecording && recordingTime > MAX_RECORDING_TIME - 60 && (
              <p className="text-xs text-orange-600">
                {MAX_RECORDING_TIME - recordingTime} seconds remaining
              </p>
            )}

            {/* Instructions */}
            <div className="text-center max-w-md">
              <p className="text-sm text-gray-600 mb-1">
                {isRecording ? 'اضغط للتوقف عن التسجيل' : 'اضغط لبدء التسجيل'}
              </p>
              <p className="text-xs text-gray-500">
                {isRecording ? 'Press to stop recording' : 'Press to start recording'}
              </p>
              {!isRecording && (
                <p className="text-xs text-gray-400 mt-2">
                  Maximum recording time: 5 minutes
                </p>
              )}
            </div>

            {/* Record/Stop Button */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={!!error}
              className={`px-8 py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isRecording ? 'إيقاف التسجيل / Stop Recording' : 'بدء التسجيل / Start Recording'}
            </button>
          </div>
        ) : (
          // Playback Preview Interface
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-md">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">تم التسجيل بنجاح!</p>
                    <p className="text-sm text-gray-600">Recording Complete</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    المدة / Duration: <span className="font-mono font-semibold">{formatTime(recordingTime)}</span>
                  </p>
                  
                  {/* Audio Player */}
                  <audio
                    ref={audioRef}
                    src={audioURL}
                    controls
                    className="w-full mt-3"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>

                <p className="text-xs text-gray-500 text-center">
                  استمع للتسجيل قبل الإرسال / Listen to your recording before submitting
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={handleReRecord}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                إعادة التسجيل / Re-record
              </button>
              
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                إرسال / Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
