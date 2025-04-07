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
    } else if (session && session.user.role === "driver") {
      router.push(`${getServiceBaseUrl("driver-frontend")}/auth`);
    } else if (session && session.user.role === "admin") {
      router.push(`${getServiceBaseUrl("admin-frontend")}/auth`);
    }
  }, [session, router]);
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-96 w-full max-w-sm">
        <CustomChat />
      </div>
    </div>
  );
}
