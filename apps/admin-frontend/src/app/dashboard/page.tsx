"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Notebook, Truck } from "lucide-react";

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

import TestNotificationPage from "./components/notifications/notification";
import OrderTablePage from "./components/orders/order-table";

export default function HomePage() {
  const { useSession, signOut } = authClient;
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("orders");

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    }
  }, [session, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  const menuComponents: Record<string, JSX.Element> = {
    orders: <OrderTablePage />, //wip - add status filter
    "driver-assignment": <OrderTablePage />, //wip
    notifications: <OrderTablePage />, //wip
  };

  return (
    <SidebarProvider className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-screen overflow-hidden">
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
                    <Truck
                      size={18}
                      strokeWidth={
                        selectedMenu === "driver-assignment" ? 2.5 : 2
                      }
                    />{" "}
                    Driver Assignment
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "notifications" ? "bg-muted font-bold" : ""}`}
                    onClick={() => setSelectedMenu("notifications")}
                  >
                    <Bell
                      size={18}
                      strokeWidth={selectedMenu === "notifications" ? 2.5 : 2}
                    />{" "}
                    Notifications
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
        <main className="flex-1 overflow-auto p-0">
          {menuComponents[selectedMenu]}
        </main>
      </div>
    </SidebarProvider>
  );
}
