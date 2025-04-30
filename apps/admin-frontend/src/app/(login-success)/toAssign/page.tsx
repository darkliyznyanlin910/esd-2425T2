"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";

import { OrderProvider } from "../../components/driver/assign-context";
import AssignTablePage from "../../components/driver/driver-table";

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
    <OrderProvider>
      <AssignTablePage />
    </OrderProvider>
  );
}
