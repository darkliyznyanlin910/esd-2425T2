"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Notebook, Truck } from "lucide-react";

import { authClient } from "@repo/auth-client";
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

export default function AppSidebar() {
  const router = useRouter();

  const { signOut } = authClient;
  const pathname = usePathname();

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
            <SidebarMenuButton
              onClick={() => router.push("/dashboard")}
              isActive={pathname === "/dashboard"}
            >
              <Home size={18} /> Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/order"}
              onClick={() => router.push("/order")}
            >
              <Notebook size={18} /> Orders
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/toAssign"}
              onClick={() => router.push("/toAssign")}
            >
              <Truck size={18} /> To Assign
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
