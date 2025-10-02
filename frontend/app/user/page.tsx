"use client";

import { useState } from "react";
import UserPageLayout from "@/components/user/UserPageLayout";
import ModeSelection from "@/components/user/ModeSelection";
import AudioRecording from "@/components/user/AudioRecording";
import TextMessage from "@/components/user/TextMessage";

export default function UserPage() {
  const [selectedMode, setSelectedMode] = useState<"audio" | "message" | null>(null);

  return (
    <UserPageLayout>
      {!selectedMode ? (
        <ModeSelection onSelectMode={setSelectedMode} />
      ) : selectedMode === "audio" ? (
        <AudioRecording onBack={() => setSelectedMode(null)} />
      ) : (
        <TextMessage onBack={() => setSelectedMode(null)} />
      )}
    </UserPageLayout>
  );
}
