"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";
import { CustomChat } from "@repo/chatbot-ui";
import { getServiceBaseUrl } from "@repo/service-discovery";

export default function ChatPage() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    } else if (session.user.role === "driver") {
      router.push(`${getServiceBaseUrl("driver-frontend")}/auth`);
    } else if (session.user.role === "admin") {
      router.push(`${getServiceBaseUrl("admin-frontend")}/auth`);
    }
  }, [session, router]);

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <div className="mb-4 flex-none">
        <h1 className="text-2xl font-bold">Chat Assistant</h1>
        <p className="text-muted-foreground">
          Ask about your orders or get help with anything related to our service
        </p>
      </div>
      <div className="min-h-0 w-full flex-1">
        <CustomChat />
      </div>
    </div>
  );
}
