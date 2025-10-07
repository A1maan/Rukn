"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, RotateCcw, Send, Upload, X } from "lucide-react";
import RegionSelector from "./RegionSelector";

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
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showRegionError, setShowRegionError] = useState(false);
  const [uploadMode, setUploadMode] = useState<'record' | 'upload'>('record');
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_RECORDING_TIME = 600; // 5 minutes in seconds
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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
    setShowRegionError(false);
    setUploadedFileName("");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith('audio/')) {
      setError("Please upload a valid audio file (MP3, WAV, OGG, M4A, etc.)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please upload a smaller file.`);
      return;
    }

    const blob = new Blob([file], { type: file.type });
    setAudioBlob(blob);
    
    const url = URL.createObjectURL(blob);
    setAudioURL(url);
    setUploadedFileName(file.name);

    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setRecordingTime(Math.floor(audio.duration));
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    handleReRecord();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;

    // Validate region selection
    if (!selectedRegion) {
      setShowRegionError(true);
      setError("Please select your region before submitting");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Create FormData to send audio file
      const formData = new FormData();
      const audioFile = new File([audioBlob], uploadedFileName || 'recording.webm', { 
        type: audioBlob.type 
      });
      
      formData.append('audio', audioFile);
      formData.append('region', selectedRegion);
      formData.append('channel', 'call'); // You can make this dynamic if needed

      // Submit to backend
      const response = await fetch('/api/analyze-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit audio');
      }

      const result = await response.json();
      console.log('Audio analysis result:', result);
      
      // Show success message
      alert(`${uploadMode === 'upload' ? 'File' : 'Recording'} submitted successfully for region: ${selectedRegion}\nProcessing complete!`);
      
      // Reset after successful submission
      handleReRecord();
      setSelectedRegion("");
      onBack();
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit audio. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Mode Toggle - Record vs Upload */}
        {!audioBlob && (
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => {
                setUploadMode('record');
                setError("");
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                uploadMode === 'record'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Mic className="w-4 h-4 inline-block mr-2" />
              تسجيل / Record
            </button>
            <button
              onClick={() => {
                setUploadMode('upload');
                setError("");
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                uploadMode === 'upload'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              رفع ملف / Upload
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">{error}</p>
          </div>
        )}

        {!audioBlob ? (
          uploadMode === 'record' ? (
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
            // Upload Interface
            <div className="flex flex-col items-center space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {/* Upload Icon */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center">
                  <Upload className="w-16 h-16 text-purple-600" />
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center max-w-md">
                <p className="text-sm text-gray-600 mb-1">
                  اختر ملف صوتي من جهازك
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Choose an audio file from your device
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: MP3, WAV, OGG, M4A, WebM<br />
                  Maximum file size: 50MB
                </p>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUploadClick}
                className="px-8 py-4 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all"
              >
                <Upload className="w-5 h-5 inline-block ml-2" />
                اختيار الملف / Choose File
              </button>
            </div>
          )
        ) : (
          // Playback Preview Interface
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-md relative">
              {/* Processing Overlay */}
              {isSubmitting && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                  <div className="animate-spin h-12 w-12 border-4 border-amber-600 border-t-transparent rounded-full mb-3"></div>
                  <p className="text-sm font-medium text-gray-700">معالجة الصوت...</p>
                  <p className="text-xs text-gray-500">Processing audio...</p>
                </div>
              )}
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300">{/* ... */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                    {uploadMode === 'upload' ? (
                      <Upload className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {uploadMode === 'upload' ? 'تم رفع الملف بنجاح!' : 'تم التسجيل بنجاح!'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {uploadMode === 'upload' ? 'File Uploaded Successfully' : 'Recording Complete'}
                    </p>
                    {uploadedFileName && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {uploadedFileName}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
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
                  استمع {uploadMode === 'upload' ? 'للملف' : 'للتسجيل'} قبل الإرسال / Preview before submitting
                </p>
              </div>
            </div>

            {/* Region Selector */}
            <div className="w-full max-w-md">
              <RegionSelector 
                selectedRegion={selectedRegion}
                onRegionChange={(region) => {
                  setSelectedRegion(region);
                  setShowRegionError(false);
                  setError("");
                }}
              />
              
              {showRegionError && !selectedRegion && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  ⚠️ يرجى اختيار المنطقة قبل الإرسال / Please select your region before submitting
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={handleReRecord}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                {uploadMode === 'upload' ? 'تغيير الملف / Change File' : 'إعادة التسجيل / Re-record'}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    معالجة... / Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    إرسال / Submit
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
