/* eslint-disable */

"use client";

import type { VariantProps } from "class-variance-authority";
import React, { useMemo } from "react";
import { cva } from "class-variance-authority";

import { ToolName } from "@repo/chatbot-common";

import { cn } from "../index";
import {
  DriverDetails,
  OrderDetails,
  OrdersList,
  ToolInvocation,
  TrackingDetails,
  UnknownTool,
} from "./components";
import { Invoice } from "./components/Invoice";
import { SelectOrder } from "./components/SelectOrder";
import { FilePreview } from "./file-preview";
import { MarkdownRenderer } from "./markdown-renderer";

const chatBubbleVariants = cva(
  "group/message relative break-words rounded-lg p-3 text-sm sm:max-w-[70%]",
  {
    variants: {
      isUser: {
        true: "bg-primary text-primary-foreground",
        false: "bg-muted text-foreground",
      },
      animation: {
        none: "",
        slide: "duration-300 animate-in fade-in-0",
        scale: "duration-300 animate-in fade-in-0 zoom-in-75",
        fade: "duration-500 animate-in fade-in-0",
      },
    },
    compoundVariants: [
      {
        isUser: true,
        animation: "slide",
        class: "slide-in-from-right",
      },
      {
        isUser: false,
        animation: "slide",
        class: "slide-in-from-left",
      },
      {
        isUser: true,
        animation: "scale",
        class: "origin-bottom-right",
      },
      {
        isUser: false,
        animation: "scale",
        class: "origin-bottom-left",
      },
    ],
  },
);

type Animation = VariantProps<typeof chatBubbleVariants>["animation"];

interface Attachment {
  name?: string;
  contentType?: string;
  url: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | (string & {});
  content: string;
  createdAt?: Date;
  experimental_attachments?: Attachment[];
  toolInvocations?: ToolInvocation[];
}

export interface ChatMessageProps extends Message {
  showTimeStamp?: boolean;
  animation?: Animation;
  actions?: React.ReactNode;
  className?: string;
  addToolResult?: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: any;
  }) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  createdAt,
  showTimeStamp = false,
  animation = "scale",
  actions,
  className,
  experimental_attachments,
  toolInvocations,
  addToolResult,
}) => {
  const files = useMemo(() => {
    return experimental_attachments?.map((attachment) => {
      const dataArray = dataUrlToUint8Array(attachment.url);
      const file = new File([dataArray], attachment.name ?? "Unknown");
      return file;
    });
  }, [experimental_attachments]);

  if (toolInvocations && toolInvocations.length > 0) {
    return (
      <ToolInvocationsRenderer
        toolInvocations={toolInvocations}
        addToolResult={addToolResult}
      />
    );
  }

  const isUser = role === "user";

  const formattedTime = createdAt?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      {files ? (
        <div className="mb-1 flex flex-wrap gap-2">
          {files.map((file, index) => {
            return <FilePreview file={file} key={index} />;
          })}
        </div>
      ) : null}

      <div className={cn(chatBubbleVariants({ isUser, animation }), className)}>
        <div>
          <MarkdownRenderer>{content}</MarkdownRenderer>
        </div>

        {role === "assistant" && actions ? (
          <div className="absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100">
            {actions}
          </div>
        ) : null}
      </div>

      {showTimeStamp && createdAt ? (
        <time
          dateTime={createdAt.toISOString()}
          className={cn(
            "mt-1 block px-1 text-xs opacity-50",
            animation !== "none" && "duration-500 animate-in fade-in-0",
          )}
        >
          {formattedTime}
        </time>
      ) : null}
    </div>
  );
};

function dataUrlToUint8Array(data: string) {
  const base64 = data.split(",")[1];
  if (!base64) {
    throw new Error("Invalid data URL");
  }
  const buf = Buffer.from(base64, "base64");
  return new Uint8Array(buf);
}

function ToolInvocationsRenderer({
  toolInvocations,
  addToolResult,
}: Pick<ChatMessageProps, "toolInvocations" | "addToolResult">) {
  if (!toolInvocations?.length) return null;

  return (
    <div className="flex flex-col items-start gap-2">
      {toolInvocations.map((invocation, index) => {
        const toolName = invocation.toolName as ToolName;

        // Route to the appropriate component based on tool name
        switch (toolName) {
          case "getDriverDetails":
            return <DriverDetails key={index} invocation={invocation} />;
          case "getOrderDetails":
            return <OrderDetails key={index} invocation={invocation} />;
          case "getOrders":
            return <OrdersList key={index} invocation={invocation} />;
          case "getTrackingDetails":
            return <TrackingDetails key={index} invocation={invocation} />;
          case "selectOrder":
            return (
              <SelectOrder
                key={index}
                invocation={invocation}
                addToolResult={addToolResult}
              />
            );
          case "getInvoice":
            return <Invoice key={index} invocation={invocation} />;
          default:
            return <UnknownTool key={index} invocation={invocation} />;
        }
      })}
    </div>
  );
}
