"use client";

import { useChat } from "@ai-sdk/react";

import { toolFunctionMap, ToolName } from "@repo/chatbot-common";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { ChatContainer, ChatForm, ChatMessages } from "@repo/ui/chat/chat";
import { Message } from "@repo/ui/chat/chat-message";
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
    addToolResult,
  } = useChat({
    api: `${getServiceBaseUrl("chatbot")}/chat/chat`,
    maxSteps: 10,
    fetch: (url, options) =>
      fetch(url, {
        ...options,
        credentials: "include",
      }),
    async onToolCall({ toolCall }) {
      const tool = toolFunctionMap[toolCall.toolName as ToolName];
      if (!tool) {
        throw new Error(`Tool ${toolCall.toolName} not found`);
      }
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
          <ChatMessages messages={messages as Message[]}>
            <MessageList
              messages={messages as Message[]}
              isTyping={isTyping}
              addToolResult={addToolResult}
            />
          </ChatMessages>
        ) : null}

        <ChatForm
          className="mt-auto"
          isPending={status == "streaming" || isTyping}
          handleSubmit={handleSubmit}
        >
          {() => (
            <MessageInput
              value={input}
              onChange={handleInputChange}
              // allowAttachments
              // files={files}
              stop={stop}
              isGenerating={status == "streaming"}
            />
          )}
        </ChatForm>
      </ChatContainer>
    </div>
  );
}
