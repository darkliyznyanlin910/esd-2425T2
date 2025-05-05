"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { Button } from "@repo/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";

let wsReuse: WebSocket | null = null;

type NotificationPageProps = {
  showComponent?: boolean;
  onNotification?: () => void;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "delay" | "assignment" | "other";
  timestamp: Date;
};

export default function NotificationComponent({
  showComponent = false,
  onNotification,
}: NotificationPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

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

        if (!message || message.data === undefined) {
          console.warn("Received message with missing data:", message);
          return;
        }

        const newNotification: Notification = {
          id: Date.now().toString(),
          timestamp: new Date(),
          message:
            typeof message.data === "string"
              ? message.data
              : JSON.stringify(message.data),
          type: "other",
          title: "Notification",
        };

        switch (message.event) {
          case "receiveDelay":
            newNotification.title = "Order Delay Notification";
            newNotification.message = `Delay: ${message.data.displayId}`;
            newNotification.type = "delay";

            toast({
              title: "Order Delay Notification",
              description: "An order has been delayed",
              variant: "info",
              duration: 5000,
            });

            if (onNotification) {
              onNotification();
            }
            break;
          case "manualAssignment":
            newNotification.title = "Order Reassignment Required";
            newNotification.message = `Reassign: ${message.data.displayId}`;
            newNotification.type = "assignment";

            toast({
              title: "Order Reassignment Required",
              description: "Please check the To Assign page",
              variant: "info",
              duration: 5000,
            });

            if (onNotification) {
              onNotification();
            }
            break;
          default:
            console.warn("Unknown event type:", message.event);
            return;
        }

        setNotifications((prev) => [newNotification, ...prev]);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    wsReuse.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    wsReuse.onclose = () => {
      console.log("WebSocket Disconnected. Attempting Reconnect...");
    };
  }, [onNotification, toast]);

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

  if (!showComponent) {
    return null;
  }

  return (
    <div className="container w-full space-y-4 p-4 px-4 py-1 md:px-6">
      <div className="mb-4 flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
          onClick={() => setNotifications([])}
        >
          Clear All
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <Alert className="h-20">
            <AlertTitle className="text-lg">
              Waiting for Notifications
            </AlertTitle>
            <AlertDescription>Nothing as of now...</AlertDescription>
          </Alert>
        ) : (
          <>
            {notifications.map((notification) => (
              <Alert key={notification.id} className="relative">
                <AlertTitle className="flex items-center justify-between">
                  <span>{notification.title}</span>
                  <span className="pr-5 text-xs opacity-70">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>
                </AlertTitle>
                <AlertDescription>{notification.message}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => removeNotification(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Alert>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
