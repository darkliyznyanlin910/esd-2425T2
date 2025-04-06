"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";

import DeliveryHistory from "~/app/components/deliveryHistory";

export default function orders() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    }
  }, [session, router]);
  return <DeliveryHistory />;
}
