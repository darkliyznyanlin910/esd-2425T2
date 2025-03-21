"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Archive, FilePlus } from "lucide-react";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/sidebar";

export function AppSidebar() {
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
    <Sidebar
      logo={
        <Image
          src="/auth-images/vannova-icon.png"
          alt="Vannova Logo"
          width={50}
          height={50}
        />
      }
      title="VanNova"
    >
      <div className="flex h-full flex-col">
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FilePlus size={18} className="mr-3" /> Create Order
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Archive size={18} className="mr-3" /> Orders
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-500"
          >
            Sign Out
          </Button>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
