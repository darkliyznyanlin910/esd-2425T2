"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";

const DriverDashboard = dynamic(
  () => import("../../components/driverDashboard"),
  { ssr: false },
);

export default function home() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    } else if (session && session.user.role === "client") {
      router.push(`${getServiceBaseUrl("customer-frontend")}/auth`);
    } else if (session && session.user.role === "admin") {
      router.push(`${getServiceBaseUrl("admin-frontend")}/auth`);
    }
  }, [session, router]);
  return (
    <main className="flex-1 p-0">
      <DriverDashboard />
    </main>
  );
}
