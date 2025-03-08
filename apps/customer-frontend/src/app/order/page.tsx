"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/button";

export default function OrderPage() {
  const { useSession, signOut } = authClient;
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    }
  }, [session, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <div>
      <h1>Order Submission Page</h1>
      <p>Welcome! Please submit your order below.</p>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}
