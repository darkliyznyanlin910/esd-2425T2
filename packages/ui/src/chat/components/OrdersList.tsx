import React from "react";

import { ToolResult } from "@repo/chatbot-common";

import {
  BaseToolProps,
  LoadingState,
  ResultHeader,
  ToolWrapper,
} from "./ToolCallBase";

interface OrdersListProps extends BaseToolProps {}

export const OrdersList: React.FC<OrdersListProps> = ({ invocation }) => {
  const { state, toolName } = invocation;

  // Handle loading states
  if (state === "partial-call" || state === "call") {
    return <LoadingState toolName={toolName} />;
  }

  const result = invocation.result as ToolResult["getOrders"];

  if (!result.length) {
    return (
      <ToolWrapper>
        <ResultHeader toolName={toolName} />
        <div className="p-2 text-sm text-muted-foreground">No orders found</div>
      </ToolWrapper>
    );
  }

  return (
    <ToolWrapper>
      <ResultHeader toolName={toolName} />
      <div className="flex flex-col gap-2 p-2">
        <div className="text-sm font-medium">Orders:</div>
        <ul className="space-y-1">
          {result.map((order, index) => (
            <li key={index} className="text-sm">
              {order}
            </li>
          ))}
        </ul>
      </div>
    </ToolWrapper>
  );
};
