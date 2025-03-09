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
  SidebarProvider,
  SidebarSeparator,
} from "@repo/ui/sidebar";

import CreateOrder from "./components/create-order";
import OrderTable from "./components/orders";

export default function OrderPage() {
  const { useSession, signOut } = authClient;
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("create-order");

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
    "create-order": <CreateOrder />,
    "order-management": <OrderTable />,
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
                    className={`flex items-center gap-2 ${selectedMenu === "create-order" ? "text-dark-blue-700 font-bold" : "text-black"}`}
                    onClick={() => setSelectedMenu("create-order")}
                  >
                    <FilePlus size={18} /> Create Order
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "order-management" ? "text-dark-blue-700 font-bold" : "text-black"}`}
                    onClick={() => setSelectedMenu("order-management")}
                  >
                    <Archive size={18} /> Order Management
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
        <main className="flex-1 p-0">{menuComponents[selectedMenu]}</main>
      </div>
    </SidebarProvider>
  );
}
