import React from "react";
import { FileIcon } from "lucide-react";

import { ToolResult } from "@repo/chatbot-common";

import { Button } from "../../button";
import {
  BaseToolProps,
  LoadingState,
  ResultHeader,
  ToolWrapper,
} from "./ToolCallBase";

interface InvoiceProps extends BaseToolProps {}

export const Invoice: React.FC<InvoiceProps> = ({ invocation }) => {
  const { state, toolName } = invocation;

  if (state === "partial-call" || state === "call") {
    return <LoadingState toolName={toolName} />;
  }

  if (state === "result") {
    const result = invocation.result as ToolResult["getInvoice"];
    return (
      <ToolWrapper>
        <ResultHeader toolName={toolName} />
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <FileIcon className="h-8 w-8 text-red-500" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Invoice</span>
              <span className="text-xs text-muted-foreground">
                Order #{result.orderId}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(result.url, "_blank")}
          >
            Download
          </Button>
        </div>
      </ToolWrapper>
    );
  }

  return (
    <ToolWrapper>
      <div className="text-sm text-muted-foreground">
        Error: Invalid invoice state
      </div>
    </ToolWrapper>
  );
};
