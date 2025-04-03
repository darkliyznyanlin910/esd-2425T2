"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";

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
    }
  }, [session, router]);
  return (
    <main className="flex-1 p-0">
      <DriverDashboard />
    </main>
  );
}
