"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Archive, FilePlus } from "lucide-react";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/sidebar";

export function AppSidebar() {
  const { signOut } = authClient;
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <img
          src="/auth-images/vannova-icon.png"
          alt="Logo"
          className="mx-auto h-20"
        />
        <p className="text-center text-2xl">
          <span className="font-extrabold text-blue-900">Van</span>
          <span className="font-bold text-gray-500">Nova</span>
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroupLabel>Applications</SidebarGroupLabel>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <FilePlus /> Create Order
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Archive /> Orders
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
    </Sidebar>
  );
}
