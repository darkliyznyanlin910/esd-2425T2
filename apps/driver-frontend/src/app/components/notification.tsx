"use client";

import { useCallback, useEffect, useRef } from "react";
import { RefreshCcw } from "lucide-react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { toast } from "@repo/ui/toast";

let wsReuse: WebSocket | null = null;

interface NotificationComponentProps {
  onNewOrder?: () => void;
}

export default function NotificationComponent({
  onNewOrder,
}: NotificationComponentProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      pingIntervalRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send("ping");
          console.log("Ping message sent to server");
        }
      }, 10000);
    };

    wsReuse.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message received:", message);

      if (!message || message.data === undefined) {
        console.warn("Received message with missing data:", message);
        return;
      }

      switch (message.event) {
        case "invalidateOrder":
          console.log("Invalidating order:", message.data);
          break;
        case "broadcastOrder":
          // Call the callback to notify parent component
          if (onNewOrder) {
            onNewOrder();
          }

          toast(
            // Use a string title instead of passing the object directly
            typeof message.data === "object"
              ? "New Order Available"
              : message.data,
            {
              description: "There is a new order available for you",
              duration: 10000,
              action: {
                label: <RefreshCcw className="h-4 w-4" />,
                onClick: () => {
                  toast.dismiss();
                  // Refresh the page when toast is dismissed
                  window.location.reload();
                },
              },
            },
          );
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
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [onNewOrder]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  return null;
}
