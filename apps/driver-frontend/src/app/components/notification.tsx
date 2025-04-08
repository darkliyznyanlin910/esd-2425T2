"use client";

import { useCallback, useEffect, useRef } from "react";

import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { useToast } from "@repo/ui/hooks/use-toast";

let wsReuse: WebSocket | null = null;

interface NotificationComponentProps {
  onNewOrder?: (orderData?: any) => void;
  onInvalidateOrder?: (orderId: string) => void;
  acceptedOrderIds?: Set<string>; // Add this prop
}

export default function NotificationComponent({
  onNewOrder,
  onInvalidateOrder,
  acceptedOrderIds = new Set(), // Default to empty set
}: NotificationComponentProps) {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { useSession } = authClient;
  const { data: session } = useSession();

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

            // Skip invalidation if this driver has accepted this order
            if (acceptedOrderIds.has(message.data.id)) {
              console.log(
                "Ignoring invalidation for order accepted by this driver:",
                message.data.id,
              );
              return;
            }

            // Only call onInvalidateOrder if this isn't the driver who accepted it
            if (onInvalidateOrder && message.data && message.data.id) {
              onInvalidateOrder(message.data.id);

              // Check if order was accepted by another driver
              if (message.data.acceptedByDriverId) {
                toast({
                  title: "Order Accepted",
                  description: `Order ID: ${message.data.displayId || ""} has been accepted by another driver.`,
                  variant: "destructive",
                  duration: 5000,
                });
              } else {
                toast({
                  title: "Order No Longer Available",
                  description: `Order ID: ${message.data.displayId || ""} is no longer available for delivery.`,
                  variant: "warning",
                  duration: 5000,
                });
              }
            }
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
  }, [
    onNewOrder,
    onInvalidateOrder,
    session?.user?.id,
    toast,
    acceptedOrderIds,
  ]); // Add acceptedOrderIds to deps

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
