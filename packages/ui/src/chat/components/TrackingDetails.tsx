import React from "react";

import { ToolResult } from "@repo/chatbot-common";

import {
  BaseToolProps,
  LoadingState,
  ResultHeader,
  ToolWrapper,
} from "./ToolCallBase";

interface TrackingDetailsProps extends BaseToolProps {}

export const TrackingDetails: React.FC<TrackingDetailsProps> = ({
  invocation,
}) => {
  const { state, toolName } = invocation;

  // Handle loading states
  if (state === "partial-call" || state === "call") {
    return <LoadingState toolName={toolName} />;
  }

  // If we have a result, display it
  if (state === "result") {
    const result = invocation.result as ToolResult["getTrackingDetails"];

    if (!result.length) {
      return (
        <ToolWrapper>
          <ResultHeader toolName={toolName} />
          <div className="p-2 text-sm text-muted-foreground">
            No tracking information available
          </div>
        </ToolWrapper>
      );
    }

    return (
      <ToolWrapper>
        <ResultHeader toolName={toolName} />
        <div className="flex flex-col gap-3 p-2">
          <div className="text-sm font-medium">Tracking History:</div>
          <div className="space-y-3">
            {result.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 border-l-2 border-muted-foreground pl-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <span className="capitalize">{item.status}</span>
                </div>
                {item.orderId && (
                  <div className="text-xs text-muted-foreground">
                    Order ID: {item.orderId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ToolWrapper>
    );
  }

  // Fallback for unexpected state
  return (
    <ToolWrapper>
      <div className="text-sm text-muted-foreground">
        Error: Invalid tracking details state
      </div>
    </ToolWrapper>
  );
};
