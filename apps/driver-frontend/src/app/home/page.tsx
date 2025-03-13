"use client";

import { useState } from "react";
import Image from "next/image";
import { Archive, CheckCircle } from "lucide-react";
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

import PendingOrders from "./components/pending-orders";
import AcceptRejectOrder from "./components/AcceptRejectOrder";

export default function DriverHomepage() {
  const [selectedMenu, setSelectedMenu] = useState("pending-orders");

  const menuComponents: Record<string, JSX.Element> = {
    "pending-orders": <PendingOrders />,
    "accept-reject-order": <AcceptRejectOrder />,
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
          title="VanNova Driver"
        >
          <SidebarSeparator className="my-2 border-gray-300" />
          <div className="flex h-full flex-col">
            <SidebarContent>
              <SidebarMenu className="block">
                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "pending-orders" ? "text-dark-blue-700 font-bold" : "text-black"}`}
                    onClick={() => setSelectedMenu("pending-orders")}
                  >
                    <Archive size={18} /> Pending Orders
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "accept-reject-order" ? "text-dark-blue-700 font-bold" : "text-black"}`}
                    onClick={() => setSelectedMenu("accept-reject-order")}
                  >
                    <CheckCircle size={18} /> Accept/Reject Order
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
              <Button
                className="w-full bg-red-600 hover:bg-red-500"
              >
                Sign Out
              </Button>
            </SidebarFooter>
          </div>
        </Sidebar>
        <main className="flex-1 p-0">{menuComponents[selectedMenu]}</main>
      </div>
    </SidebarProvider>
  );
}
