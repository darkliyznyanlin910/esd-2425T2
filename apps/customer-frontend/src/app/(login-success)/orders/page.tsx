"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";

import OrderTable from "~/app/components/orders";

export default function Main() {
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
  return <OrderTable />;
}
