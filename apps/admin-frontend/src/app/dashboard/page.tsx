"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Notebook, Truck } from "lucide-react";

import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@repo/ui/sidebar";

import { OrderProvider } from "./components/driver/assign-context";
import AssignTablePage from "./components/driver/driver-table";
import NotificationComponent from "./components/notifications/notification";
import OrderTablePage from "./components/orders/order-table";

export default function HomePage() {
  const { useSession, signOut } = authClient;
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("orders");

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    } else if (session && session.user.role === "driver") {
      router.push(`${getServiceBaseUrl("driver-frontend")}/auth`);
    } else if (session && session.user.role === "client") {
      router.push(`${getServiceBaseUrl("customer-frontend")}/auth`);
    }
  }, [session, router]);
  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  const menuComponents: Record<string, JSX.Element> = {
    orders: <OrderTablePage />,
    toAssign: (
      <OrderProvider>
        <AssignTablePage />
      </OrderProvider>
    ),
    notifications: <NotificationComponent showComponent={true} />,
  };

  return (
    <SidebarProvider className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-screen overflow-hidden">
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
          <SidebarSeparator className="my-2 border-gray-300" />
          <div className="flex h-full flex-col">
            <SidebarContent>
              <SidebarMenu className="block">
                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "orders" ? "bg-muted font-bold" : ""}`}
                    onClick={() => setSelectedMenu("orders")}
                  >
                    <Notebook size={18} /> Orders
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "toAssign" ? "bg-muted font-bold" : ""}`}
                    onClick={() => setSelectedMenu("toAssign")}
                  >
                    <Truck size={18} /> To Assign
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
        <main className="flex-1 overflow-auto p-0">
          {menuComponents[selectedMenu]}
        </main>
      </div>
    </SidebarProvider>
  );
}
