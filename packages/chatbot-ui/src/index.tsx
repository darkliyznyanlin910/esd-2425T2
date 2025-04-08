"use client";

import { useChat } from "@ai-sdk/react";
import { Sparkles } from "lucide-react";

import { toolFunctionMap, ToolName } from "@repo/chatbot-common";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
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
    reload,
    isLoading,
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
    <Card className="flex h-full flex-col border-none shadow-none">
      <CardContent className="flex h-full flex-col p-0">
        <ChatContainer className="flex h-full flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {isEmpty ? (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="max-w-md space-y-4 text-center">
                  <Sparkles className="mx-auto h-12 w-12 text-primary opacity-80" />
                  <h2 className="text-xl font-semibold">
                    How can I help you today?
                  </h2>
                  <p className="text-muted-foreground">
                    Ask me about your orders, delivery status, or any other
                    questions about our service.
                  </p>
                </div>

                <PromptSuggestions
                  append={append}
                  suggestions={[
                    "What are my recent orders?",
                    "What is the status on my latest order?",
                    "How do I track my delivery?",
                    "Can I change my delivery address?",
                  ]}
                  label="Try asking"
                />
              </div>
            ) : (
              <ChatMessages messages={messages as Message[]}>
                <MessageList
                  messages={messages as Message[]}
                  isTyping={isTyping}
                  addToolResult={addToolResult}
                />
              </ChatMessages>
            )}
          </div>

          <div className="flex-none border-t bg-background/95 p-4 backdrop-blur-sm">
            <ChatForm
              className="mx-auto max-w-2xl"
              isPending={status == "streaming" || isTyping}
              handleSubmit={handleSubmit}
            >
              {() => (
                <MessageInput
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  stop={stop}
                  isGenerating={status == "streaming"}
                />
              )}
            </ChatForm>
          </div>
        </ChatContainer>
      </CardContent>
    </Card>
  );
}
