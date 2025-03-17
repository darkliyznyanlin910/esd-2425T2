import React from "react";

import { ToolResult } from "@repo/chatbot-common";

import {
  BaseToolProps,
  LoadingState,
  ResultHeader,
  ToolWrapper,
} from "./ToolCallBase";

interface DriverDetailsProps extends BaseToolProps {}

export const DriverDetails: React.FC<DriverDetailsProps> = ({ invocation }) => {
  const { state, toolName } = invocation;

  // Handle loading states
  if (state === "partial-call" || state === "call") {
    return <LoadingState toolName={toolName} />;
  }

  // If we have a result, display it
  if (state === "result") {
    const result = invocation.result as ToolResult["getDriverDetails"];
    return (
      <ToolWrapper>
        <ResultHeader toolName={toolName} />
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Driver:</span>
            <span>{result.driverName}</span>
          </div>
          {result.driverPhone && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Contact:</span>
              <span>{result.driverPhone}</span>
            </div>
          )}
          {result.orderId && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Order ID:</span>
              <span>{result.orderId}</span>
            </div>
          )}
        </div>
      </ToolWrapper>
    );
  }

  // Fallback for unexpected state
  return (
    <ToolWrapper>
      <div className="text-sm text-muted-foreground">
        Error: Invalid driver details state
      </div>
    </ToolWrapper>
  );
};
