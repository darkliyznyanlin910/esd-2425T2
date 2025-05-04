"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bot, Home, Notebook } from "lucide-react";

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

export function AppSidebar() {
  const { signOut } = authClient;
  const router = useRouter();
  const pathname = usePathname();

  // Define menu items for scalable sidebar
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Notebook, label: "Orders", path: "/orders" },
    { icon: Bot, label: "ChatBot", path: "/chat" },
  ];

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
