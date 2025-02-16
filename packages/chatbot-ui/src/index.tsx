"use client";

import { useChat } from "@ai-sdk/react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { ChatContainer, ChatForm, ChatMessages } from "@repo/ui/chat/chat";
import { MessageInput } from "@repo/ui/chat/message-input";
import { MessageList } from "@repo/ui/chat/message-list";
import { PromptSuggestions } from "@repo/ui/chat/prompt-suggestions";

import { toolFunctionMap } from "./tools";

export function CustomChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    stop,
  } = useChat({
    api: `${getServiceBaseUrl("chatbot")}/chat`,
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      const tool =
        toolFunctionMap[toolCall.toolName as keyof typeof toolFunctionMap];
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
    <ChatContainer className="gap-2">
      {isEmpty ? (
        <PromptSuggestions
          append={append}
          suggestions={["What is the capital of France?", "Tell me a joke"]}
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
        isPending={isLoading || isTyping}
        handleSubmit={handleSubmit}
      >
        {({ files, setFiles }) => (
          <MessageInput
            value={input}
            onChange={handleInputChange}
            allowAttachments
            files={files}
            setFiles={setFiles}
            stop={stop}
            isGenerating={isLoading}
          />
        )}
      </ChatForm>
    </ChatContainer>
  );
}
