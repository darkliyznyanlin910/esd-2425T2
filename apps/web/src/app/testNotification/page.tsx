"use client";

import { useEffect, useState } from "react";

export default function TestNotificationPage() {
  const [data, setData] = useState<string>("test");

  useEffect(() => {
    console.log("Establishing SSE connection...");
    const eventSource = new EventSource("http://localhost:3004/driver/sse", {
      withCredentials: false, // explicitly disable credentials
    });

    eventSource.addEventListener("broadcastOrder", (e) => {
      console.log("Broadcast order received:", e);
      setData(e.data);
    });

    eventSource.addEventListener("invalidateOrder", (e) => {
      console.log("Invalidate order received:", e);
      setData(e.data);
    });

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <div>Current data: {data}</div>
      <pre>
        {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
