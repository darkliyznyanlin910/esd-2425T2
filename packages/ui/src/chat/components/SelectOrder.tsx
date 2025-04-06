import React, { useState } from "react";

import { backendTools } from "@repo/chatbot-common";

import { Button } from "../../button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";
import {
  BaseToolProps,
  LoadingState,
  ResultHeader,
  ToolWrapper,
} from "./ToolCallBase";

interface SelectOrderProps extends BaseToolProps {
  addToolResult?: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: any;
  }) => void;
}

// Define the result type explicitly
interface SelectOrderResult {
  orderId: string;
  displayId: string;
}

export const SelectOrder: React.FC<SelectOrderProps> = ({
  invocation,
  addToolResult,
}) => {
  const { state, toolName, toolCallId } = invocation;
  const [selectedOrder, setSelectedOrder] = useState<string>("");

  console.log("selectedOrder", selectedOrder);

  const handleSubmit = (order: { orderId: string; displayId: string }) => {
    console.log("toolCallId", toolCallId);
    if (selectedOrder) {
      if (addToolResult && toolCallId) {
        // Use addToolResult if available and we have a toolCallId
        addToolResult({
          toolCallId,
          result: order,
        });
      }
    }
  };

  // Handle loading states
  if (state === "partial-call") {
    return <LoadingState toolName={toolName} />;
  }

  if (state === "call") {
    const { orders } = backendTools.selectOrder.parameters.parse(
      invocation.args,
    );
    return (
      <ToolWrapper>
        <div className="flex flex-col gap-3 p-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">Please select an order:</span>
          </div>

          <Select value={selectedOrder} onValueChange={setSelectedOrder}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an order" />
            </SelectTrigger>
            <SelectContent>
              {orders.map((order) => (
                <SelectItem key={order.orderId} value={order.orderId}>
                  {order.displayId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() =>
              handleSubmit(
                orders.find((order) => order.orderId === selectedOrder)!,
              )
            }
            disabled={!selectedOrder}
            className="mt-2 w-full"
          >
            Confirm Selection
          </Button>
        </div>
      </ToolWrapper>
    );
  }

  // Use the explicit type for clarity
  const result = invocation.result as unknown as SelectOrderResult;

  return (
    <ToolWrapper>
      <ResultHeader toolName={toolName} />
      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Selected Order:</span>
          <span>{result.displayId}</span>
        </div>
      </div>
    </ToolWrapper>
  );
};
