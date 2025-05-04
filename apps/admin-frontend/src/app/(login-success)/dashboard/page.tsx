"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";

import Dashboard from "~/app/components/dashboard/dashboard";
import NotificationComponent from "~/app/components/notifications/notification";

export default function Main() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    } else if (session.user.role === "driver") {
      router.push(`${getServiceBaseUrl("driver-frontend")}/auth`);
    } else if (session.user.role === "customer") {
      router.push(`${getServiceBaseUrl("customer-frontend")}/auth`);
    }
  }, [session, router]);
  return (
    <div className="flex w-screen flex-col">
      <Dashboard />
      <NotificationComponent showComponent={true} />
    </div>
  );
}
