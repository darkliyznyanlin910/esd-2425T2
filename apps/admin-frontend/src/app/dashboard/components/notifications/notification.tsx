"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";

let wsReuse: WebSocket | null = null;

export default function TestNotificationPage() {
  const [data, setData] = useState<string>("Nothing as of now...");
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    if (wsReuse && wsReuse.readyState === WebSocket.OPEN) {
      console.log("Reusing existing WebSocket connection");
      wsRef.current = wsReuse;
      return;
    }

    if (wsReuse && wsReuse.readyState !== WebSocket.CLOSED) {
      wsReuse.close();
    }

    console.log("Creating new WebSocket connection...");

    const wsUrl = `${getServiceBaseUrl("notification")}/admin/ws`;
    wsReuse = new WebSocket(wsUrl);
    wsRef.current = wsReuse;

    wsReuse.onopen = () => {
      console.log("WebSocket Connected");
    };

    wsReuse.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message received:", message);

      switch (message.event) {
        case "receiveDelay":
          setData(`Delay: ${message.data}`);
          break;
        case "manualAssignment":
          setData(`Reassigned: ${message.data}`);
          break;
        default:
          console.warn("Unknown event type:", message.event);
      }
    };

    wsReuse.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    wsReuse.onclose = () => {
      console.log("WebSocket Disconnected. Attempting Reconnect...");
    };
  }, []);

  useEffect(() => {
    connectWebSocket();

    if (wsReuse) {
      const handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        switch (message.event) {
          case "receiveDelay":
            setData(`Delay: ${message.data}`);
            break;
          case "manualAssignment":
            setData(`Reassigned: ${message.data}`);
            break;
        }
      };

      wsReuse.addEventListener("message", handleMessage);

      return () => {
        wsReuse?.removeEventListener("message", handleMessage);
      };
    }
  }, [connectWebSocket]);

  return (
    <div className="p-4">
      <Alert className="h-20">
        <AlertTitle>Notification</AlertTitle>
        <AlertDescription>{data}</AlertDescription>
      </Alert>
    </div>
  );
}
