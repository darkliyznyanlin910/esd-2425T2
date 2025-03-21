"use client";

import { CustomChat } from "@repo/chatbot-ui";

export default function ChatPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-96 w-full max-w-sm">
        <CustomChat />
      </div>
    </div>
  );
}
