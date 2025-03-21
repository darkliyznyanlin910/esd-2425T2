"use client";

import { useEffect, useState } from "react";

export default function TestNotificationPage() {
  const [data, setData] = useState<string>("test");

  useEffect(() => {
    console.log("Establishing SSE connection...");
    const eventSource = new EventSource("http://localhost:3004/admin/sse", {
      withCredentials: false, // explicitly disable credentials
    });

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
    <div className="container mx-auto h-screen py-6">
      <div className="text-xl font-semibold">Notifications</div>
      <div>Current data: {data}</div>
      <pre>
        {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
