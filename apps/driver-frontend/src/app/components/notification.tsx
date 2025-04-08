"use client";

import { useCallback, useEffect, useRef } from "react";
import { RefreshCcw } from "lucide-react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { useToast } from "@repo/ui/hooks/use-toast";
import { ToastAction } from "@repo/ui/toast";

let wsReuse: WebSocket | null = null;

interface NotificationComponentProps {
  onNewOrder?: (orderData?: any) => void;
}

export default function NotificationComponent({
  onNewOrder,
}: NotificationComponentProps) {
  const { toast } = useToast();
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
      if (typeof event.data === "string") {
        if (event.data.startsWith("{") || event.data.startsWith("[")) {
          console.log("Received message:", event.data);
        } else {
          console.log("Is a String: ", event.data);
          return;
        }
      }

      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);

        if (!message || !message.data) {
          console.warn("Received message with missing data:", message);
          return;
        }

        switch (message.event) {
          case "invalidateOrder":
            console.log("Invalidating order:", message.data);
            break;
          case "broadcastOrder":
            if (onNewOrder && message.data) {
              onNewOrder(message.data);
            }

            toast({
              title: "New Order Available",
              description: `Order ID: ${message.data.displayId || ""}\n\nOrder Details: ${message.data.orderDetails || ""}`,
              duration: 10000,
            });
            break;
          default:
            console.warn("Unknown event type:", message.event);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
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
