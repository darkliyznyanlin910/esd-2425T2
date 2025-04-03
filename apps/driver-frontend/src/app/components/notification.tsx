"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { toast } from "@repo/ui/toast";

let wsReuse: WebSocket | null = null;

export default function NotificationComponent() {
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

    const wsUrl = `${getServiceBaseUrl("notification")}/driver/ws`;
    wsReuse = new WebSocket(wsUrl);
    wsRef.current = wsReuse;

    wsReuse.onopen = () => {
      console.log("WebSocket Connected");
    };

    wsReuse.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message received:", message);

      switch (message.event) {
        case "invalidateOrder":
          toast(message.data, {
            description: `${message.data}`,
            duration: 5000,
            action: {
              label: <X className="h-4 w-4" />,
              onClick: () => toast.dismiss(),
            },
          });
          break;
        case "broadcastOrder":
          toast(message.data, {
            description: `${message.data}`,
            duration: 5000,
            action: {
              label: <X className="h-4 w-4" />,
              onClick: () => toast.dismiss(),
            },
          });
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
  }, [toast]);

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  return null;
}
