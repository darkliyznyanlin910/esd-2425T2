"use client";

import { useChat } from "@ai-sdk/react";

import { toolFunctionMap } from "@repo/chatbot-common";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { ChatContainer, ChatForm, ChatMessages } from "@repo/ui/chat/chat";
import { MessageInput } from "@repo/ui/chat/message-input";
import { MessageList } from "@repo/ui/chat/message-list";
import { PromptSuggestions } from "@repo/ui/chat/prompt-suggestions";

export function CustomChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    append,
    stop,
  } = useChat({
    api: `${getServiceBaseUrl("chatbot")}/chat`,
    maxSteps: 10,
    async onToolCall({ toolCall }) {
      const tool =
        toolFunctionMap[toolCall.toolName as keyof typeof toolFunctionMap];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await tool(toolCall.args as any);
      return result;
    },
  });

  const lastMessage = messages.at(-1);
  const isEmpty = messages.length === 0;
  const isTyping = lastMessage?.role === "user";

  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-xl border p-2">
      <h1 className="text-xl font-bold">Customer Support</h1>
      <ChatContainer className="w-full flex-1">
        {isEmpty ? (
          <PromptSuggestions
            append={append}
            suggestions={[
              "What are my recent orders?",
              "What is the status on my latest order?",
            ]}
            label="Suggestions"
          />
        ) : null}

        {!isEmpty ? (
          <ChatMessages messages={messages}>
            <MessageList messages={messages} isTyping={isTyping} />
          </ChatMessages>
        ) : null}

        <ChatForm
          className="mt-auto"
          isPending={status == "streaming" || isTyping}
          handleSubmit={handleSubmit}
        >
          {({ files, setFiles }) => (
            <MessageInput
              value={input}
              onChange={handleInputChange}
              // allowAttachments
              files={files}
              setFiles={setFiles}
              stop={stop}
              isGenerating={status == "streaming"}
            />
          )}
        </ChatForm>
      </ChatContainer>
    </div>
  );
}
