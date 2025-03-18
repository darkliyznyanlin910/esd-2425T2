import React from "react";

import { ToolResult } from "@repo/chatbot-common";

import {
  BaseToolProps,
  LoadingState,
  ResultHeader,
  ToolWrapper,
} from "./ToolCallBase";

interface OrderDetailsProps extends BaseToolProps {}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ invocation }) => {
  const { state, toolName } = invocation;

  // Handle loading states
  if (state === "partial-call" || state === "call") {
    return <LoadingState toolName={toolName} />;
  }

  const result = invocation.result as ToolResult["getOrderDetails"];
  return (
    <ToolWrapper>
      <ResultHeader toolName={toolName} />
      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <span className="capitalize">{result.status}</span>
        </div>
        {result.orderId && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Order ID:</span>
            <span>{result.orderId}</span>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
};
