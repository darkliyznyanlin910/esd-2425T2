"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Archive, Bell, FilePlus, Notebook, Truck } from "lucide-react";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@repo/ui/sidebar";

export default function TestPage() {
  const { useSession, signOut } = authClient;
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("");

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
    <SidebarProvider>
      <div className="flex min-h-screen">
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
          <SidebarSeparator className="my-2 border-gray-300" />
          <div className="flex h-full flex-col">
            <SidebarContent>
              <SidebarMenu className="block">
                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "orders" ? "bg-muted font-bold" : ""}`}
                    onClick={() => setSelectedMenu("orders")}
                  >
                    <Notebook
                      size={18}
                      strokeWidth={selectedMenu === "orders" ? 2.5 : 2}
                    />{" "}
                    Orders
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "driver-assignment" ? "bg-muted font-bold" : ""}`}
                    onClick={() => setSelectedMenu("driver-assignment")}
                  >
                    <Truck size={18} /> Driver Assignment
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "notifications" ? "bg-muted font-bold" : ""}`}
                    onClick={() => setSelectedMenu("notifications")}
                  >
                    <Bell size={18} /> Notifications
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
      </div>
    </SidebarProvider>
  );
}
