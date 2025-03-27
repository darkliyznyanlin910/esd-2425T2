"use client";

import { useEffect, useState } from "react";

import { getServiceBaseUrl } from "@repo/service-discovery";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { Button } from "@repo/ui/button";

export default function TestNotificationPage() {
  const [data, setData] = useState<string>("test");

  useEffect(() => {
    console.log("Establishing SSE connection...");
    const eventSource = new EventSource(
      `${getServiceBaseUrl("notification")}/admin/sse`,
      {
        withCredentials: false,
      },
    );

    eventSource.addEventListener("receiveDelay", (e) => {
      console.log("Delay Notification received:", e);
      setData(e.data);
    });

    eventSource.addEventListener("manualAssignment", (e) => {
      console.log("Reassignment order received:", e);
      setData(e.data);
    });

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, []);

  return (
    <div className="p-4">
      <Alert className="h-20">
        <AlertTitle>Notification</AlertTitle>
        <AlertDescription>{data}</AlertDescription>
      </Alert>
    </div>
  );
}
