"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Truck, User2 } from "lucide-react";

import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";
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
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Truck, label: "My Deliveries", path: "/orders" },
    { icon: User2, label: "Account", path: "/account" },
  ];

  const handleSignOut = async () => {
    try {
      const session = await authClient.getSession();

      if (!session) {
        console.error("Session not found after sign-in.");
        return;
      }
      const response = await fetch(
        `${getServiceBaseUrl("driver")}/driver/${session.data?.user.id}/availability`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ availability: "OFFLINE" }),
        },
      );
      console.log(session.data?.user.id);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating driver availability:", errorData);
        return;
      }

      const data = await response.json();
      console.log("Driver availability updated:", data);
    } catch (error) {
      console.error("Failed to update driver availability:", error);
    }
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
          {menuItems.map(({ icon: Icon, label, path }) => (
            <SidebarMenuItem key={path}>
              <SidebarMenuButton
                isActive={pathname === path}
                onClick={() => router.push(path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  pathname === path ? "border-l-4 border-blue-600 bg-blue-50" : ""
                }`}
              >
                <Icon /> {label}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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
