"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { toast } from "@repo/ui/toast";

let wsReuse: WebSocket | null = null;

export default function NotificationComponent() {
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
          wsRef.current.send(JSON.stringify({ type: "ping" }));
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
          // toast(
          //   // Use a string title instead of passing the object directly
          //   typeof message.data === "object"
          //     ? "Order Invalidated"
          //     : message.data,
          //   {
          //     // For the description, you can stringify the object if needed
          //     description: "Order has been invalidated",
          //     duration: 10000,
          //     action: {
          //       label: <X className="h-4 w-4" />,
          //       onClick: () => toast.dismiss(),
          //     },
          //   },
          // );
          break;
        case "broadcastOrder":
          toast(
            // Use a string title instead of passing the object directly
            typeof message.data === "object"
              ? "New Order Available"
              : message.data,
            {
              description: "New order available",
              duration: 10000,
              action: {
                label: <X className="h-4 w-4" />,
                onClick: () => toast.dismiss(),
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
  }, [toast]);

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
