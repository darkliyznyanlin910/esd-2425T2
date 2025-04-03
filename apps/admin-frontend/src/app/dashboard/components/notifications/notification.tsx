"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { toast } from "@repo/ui/toast";

let wsReuse: WebSocket | null = null;

type NotificationPageProps = {
  showComponent?: boolean;
};

export default function NotificationComponent({
  showComponent = false,
}: NotificationPageProps) {
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
          toast(message.data, {
            description: `${message.data}`,
            duration: 5000,
            action: {
              label: <X className="h-4 w-4" />,
              onClick: () => toast.dismiss(),
            },
          });
          break;
        case "manualAssignment":
          setData(`Reassigned: ${message.data}`);
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
  }, []);

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
