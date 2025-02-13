"use client";

import { useChat } from "@ai-sdk/react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { ChatContainer, ChatForm, ChatMessages } from "@repo/ui/chat/chat";
import { MessageInput } from "@repo/ui/chat/message-input";
import { MessageList } from "@repo/ui/chat/message-list";
import { PromptSuggestions } from "@repo/ui/chat/prompt-suggestions";

import { tools } from "./tools";

export function CustomChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    addToolResult,
    isLoading,
    append,
    stop,
  } = useChat({
    api: `${getServiceBaseUrl("chatbot")}/chat`,
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      const tool = tools[toolCall.toolName as keyof typeof tools] as
        | (typeof tools)[keyof typeof tools]
        | undefined;
      if (!tool) {
        throw new Error(`Tool ${toolCall.toolName} not found`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await tool.execute(toolCall.args as any);
      addToolResult({
        toolCallId: toolCall.toolCallId,
        result,
      });
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
