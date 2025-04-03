"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth/client";

import OrderTable from "~/app/components/orders";

export default function Main() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    }
  }, [session, router]);
  return <OrderTable />;
}
