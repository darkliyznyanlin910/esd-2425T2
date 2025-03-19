"use client";

import type { ChatMessageProps, Message } from "./chat-message";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>;

export interface MessageListProps {
  messages: Message[];
  showTimeStamps?: boolean;
  isTyping?: boolean;
  messageOptions?:
    | AdditionalMessageOptions
    | ((message: Message) => AdditionalMessageOptions);
  addToolResult?: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: any;
  }) => void;
}

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
  addToolResult,
}: MessageListProps) {
  return (
    <div className="space-y-4 overflow-visible">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions;

        return (
          <ChatMessage
            key={index}
            showTimeStamp={showTimeStamps}
            {...message}
            {...additionalOptions}
            addToolResult={addToolResult}
          />
        );
      })}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
