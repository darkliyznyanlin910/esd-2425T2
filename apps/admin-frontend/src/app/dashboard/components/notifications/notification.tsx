"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { useToast } from "@repo/ui/hooks/use-toast";

let wsReuse: WebSocket | null = null;

type NotificationPageProps = {
  showComponent?: boolean;
  onNotification?: () => void;
};

export default function NotificationComponent({
  showComponent = false,
  onNotification,
}: NotificationPageProps) {
  const [data, setData] = useState<string>("Nothing as of now...");
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
        case "receiveDelay":
          setData(`Delay: ${message.data}`);
          toast({
            title: "Order Delay Notification",
            description: "An order has been delayed",
            duration: 5000,
          });
          if (onNotification) {
            onNotification();
          }
          break;
        case "manualAssignment":
          setData(`Reassigned: ${message.data}`);
          toast({
            title: "Order Reassignment Required",
            description: "Please check the To Assign page",
            duration: 5000,
          });
          if (onNotification) {
            onNotification();
          }
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
  }, [onNotification]);

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  if (!showComponent) {
    return null;
  }

  return (
    <div className="p-4">
      <Alert className="h-20">
        <AlertTitle>Notification</AlertTitle>
        <AlertDescription>{data}</AlertDescription>
      </Alert>
    </div>
  );
}
