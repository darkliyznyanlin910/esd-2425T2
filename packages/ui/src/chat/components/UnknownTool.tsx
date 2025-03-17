import React from "react";

import {
  BaseToolProps,
  LoadingState,
  ResultHeader,
  ToolWrapper,
} from "./ToolCallBase";

export const UnknownTool: React.FC<BaseToolProps> = ({ invocation }) => {
  const { state, toolName } = invocation;

  // Handle loading states
  if (state === "partial-call" || state === "call") {
    return <LoadingState toolName={toolName} />;
  }

  // If we have a result, display it
  if (state === "result") {
    const result = invocation.result;
    return (
      <ToolWrapper>
        <ResultHeader toolName={toolName} />
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Tool:</span>
            <span>{toolName}</span>
          </div>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </ToolWrapper>
    );
  }

  // Fallback for unexpected state
  return (
    <ToolWrapper>
      <div className="text-sm text-muted-foreground">
        Error: Invalid tool state
      </div>
    </ToolWrapper>
  );
};
