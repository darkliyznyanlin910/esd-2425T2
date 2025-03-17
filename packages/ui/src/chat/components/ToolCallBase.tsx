import React from "react";
import { ReloadIcon, RocketIcon } from "@radix-ui/react-icons";
import { Code2 } from "lucide-react";

import { ToolName, ToolResult } from "@repo/chatbot-common";

export type ToolState = "partial-call" | "call" | "result";

export interface PartialToolCall {
  state: "partial-call";
  toolName: ToolName | string;
  toolCallId?: string;
}

export interface ToolCall {
  state: "call";
  toolName: ToolName | string;
  args: any;
  toolCallId: string;
}

export interface ToolResultCall {
  state: "result";
  toolName: ToolName | string;
  result: any;
  toolCallId?: string;
}

export type ToolInvocation = PartialToolCall | ToolCall | ToolResultCall;

export interface BaseToolProps {
  invocation: ToolInvocation;
  addToolResult?: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: any;
  }) => void;
}

export const LoadingState: React.FC<{ toolName: string }> = ({ toolName }) => (
  <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground">
    <RocketIcon className="h-4 w-4" />
    <span>Calling {toolName}...</span>
    <ReloadIcon className="h-3 w-3 animate-spin" />
  </div>
);

export const ResultHeader: React.FC<{ toolName: string }> = ({ toolName }) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    <Code2 className="h-4 w-4" />
    <span>Result from {toolName}</span>
  </div>
);

export const ToolWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="flex flex-col gap-1.5 rounded-lg border bg-muted px-3 py-2 text-sm">
    {children}
  </div>
);
