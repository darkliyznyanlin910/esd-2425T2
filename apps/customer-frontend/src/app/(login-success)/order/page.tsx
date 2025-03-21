"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth/client";

import CreateOrderPage from "~/app/components/create-order";

export default function main() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    }
  }, [session, router]);
  return <CreateOrderPage />;
}
