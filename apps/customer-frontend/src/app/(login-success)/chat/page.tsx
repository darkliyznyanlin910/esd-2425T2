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
    <main className="min-h-screen w-full px-4 py-6 md:px-6">
      <div className="flex h-full w-full flex-1 flex-col">
        <div className="mb-7 flex-none">
          <h2 className="pb-2 text-3xl font-bold tracking-tighter sm:text-3xl md:text-3xl">
            Chat Assistant
          </h2>
          <p className="text-muted-foreground">
            Ask about your orders or get help with anything related to our
            service
          </p>
        </div>
        <div className="min-h-0 w-full flex-1">
          <CustomChat />
        </div>
      </div>
    </main>
  );
}
