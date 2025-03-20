"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Archive,
  CheckCircle,
  User,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog";

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

interface Order {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "pickup" | "delivered";
  deliveryTime?: string;
}

interface DriverProfile {
  driverId: string;
  phone: string;
  email: string;
  password: string;
  updatedAt: string;
}

import { PendingOrdersWrapper } from "./components/pendingOrders";
import { AcceptRejectOrderWrapper } from "./components/acceptReject";
import { ProfileManagementWrapper } from "./components/profile";

export default function DriverHomepage() {
  const [selectedMenu, setSelectedMenu] = useState("pending-orders");

  const [pendingOrders, setPendingOrders] = useState<Order[]>([
    {
      id: "1",
      name: "Order #22345673",
      description: "Pickup Parcel ABC234 from AAA Warehouse, Deliver to XXX",
      status: "pending",
    },
    {
      id: "2",
      name: "Order #7845672",
      description: "Pickup Parcel ABC123 from YYY Warehouse, Deliver to XXX",
      status: "pending",
    },
    {
      id: "3",
      name: "Order #46569631",
      description: "Pickup Parcel DEF134 from ZZZ Warehouse, Deliver to XXX",
      status: "pending",
    },
  ]);

  const [ordersToReview, setOrdersToReview] = useState<Order[]>([
    {
      id: "123",
      name: "Order #93457682",
      description: "Pickup from BBB Store, Deliver to XXX",
      status: "pending",
    },
    {
      id: "234",
      name: "Order #88888888",
      description: "Pickup from CCC Store, Deliver to XXX",
      status: "pending",
    },
  ]);

  const [driverProfile, setDriverProfile] = useState<DriverProfile>({
    driverId: "DRV-10025",
    phone: "+1 (555) 123-4567",
    email: "driver@vannova.com",
    password: "••••••••",
    updatedAt: new Date().toISOString(),
  });

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [phoneValue, setPhoneValue] = useState(driverProfile.phone);
  const [emailValue, setEmailValue] = useState(driverProfile.email);
  const [passwordValue, setPasswordValue] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState<string | null>(null);

  const handleProfileUpdate = (field: "phone" | "email" | "password") => {
    const currentTime = new Date().toISOString();

    if (field === "phone" && phoneValue) {
      setDriverProfile((prev) => ({
        ...prev,
        phone: phoneValue,
        updatedAt: currentTime,
      }));
      setIsEditingPhone(false);
    } else if (field === "email" && emailValue) {
      setDriverProfile((prev) => ({
        ...prev,
        email: emailValue,
        updatedAt: currentTime,
      }));
      setIsEditingEmail(false);
    } else if (field === "password" && passwordValue) {
      setDriverProfile((prev) => ({
        ...prev,
        password: "••••••••", 
        updatedAt: currentTime,
      }));
      setPasswordValue("");
      setIsEditingPassword(false);
    }
  };

  const cancelEdit = (field: "phone" | "email" | "password") => {
    if (field === "phone") {
      setPhoneValue(driverProfile.phone);
      setIsEditingPhone(false);
    } else if (field === "email") {
      setEmailValue(driverProfile.email);
      setIsEditingEmail(false);
    } else {
      setPasswordValue("");
      setIsEditingPassword(false);
    }
  };

  const handleAccept = (id: string) => {
    const orderIndex = ordersToReview.findIndex((order) => order.id === id);

    if (orderIndex !== -1) {
      const orderToAccept = ordersToReview[orderIndex];
      if (!orderToAccept) {
        return;
      }

      setPendingOrders((prevOrders) => [...prevOrders, orderToAccept]);

      setOrdersToReview((prevOrders) =>
        prevOrders.filter((_, index) => index !== orderIndex),
      );

      setSelectedMenu("pending-orders");
    }
  };

  const initiateReject = (id: string) => {
    setOrderToReject(id);
    setAlertOpen(true);
  };

  const confirmReject = () => {
    if (orderToReject) {
      setOrdersToReview((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderToReject),
      );
      setOrderToReject(null);
    }
    setAlertOpen(false);
  };

  const cancelReject = () => {
    setOrderToReject(null);
    setAlertOpen(false);
  };

  const handlePickup = (id: string) => {
    setPendingOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: "pickup" } : order,
      ),
    );
  };

  const handleDelivered = (id: string) => {
    const currentTimestamp = new Date().toLocaleString();
    setPendingOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? { ...order, status: "delivered", deliveryTime: currentTimestamp }
          : order,
      ),
    );
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
                    <Archive size={18} /> Pending Orders{" "}
                    {pendingOrders.length > 0 && `(${pendingOrders.length})`}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "accept-reject-order" ? "text-dark-blue-700 font-bold" : "text-black"}`}
                    onClick={() => setSelectedMenu("accept-reject-order")}
                  >
                    <CheckCircle size={18} /> Accept/Reject Order{" "}
                    {ordersToReview.length > 0 && `(${ordersToReview.length})`}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "profile-management" ? "text-dark-blue-700 font-bold" : "text-black"}`}
                    onClick={() => setSelectedMenu("profile-management")}
                  >
                    <User size={18} /> Profile Management
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
              <Button className="w-full bg-red-600 hover:bg-red-500">
                Sign Out
              </Button>
            </SidebarFooter>
          </div>
        </Sidebar>
        <main className="flex-1 p-0">
          {selectedMenu === "pending-orders" ? (
            <PendingOrdersWrapper
              orders={pendingOrders}
              handlePickup={handlePickup}
              handleDelivered={handleDelivered}
            />
          ) : selectedMenu === "accept-reject-order" ? (
            <AcceptRejectOrderWrapper
              orders={ordersToReview}
              handleAccept={handleAccept}
              handleReject={initiateReject}
            />
          ) : (
            <ProfileManagementWrapper
              profile={driverProfile}
              isEditingPhone={isEditingPhone}
              isEditingEmail={isEditingEmail}
              isEditingPassword={isEditingPassword}
              phoneValue={phoneValue}
              emailValue={emailValue}
              passwordValue={passwordValue}
              setIsEditingPhone={setIsEditingPhone}
              setIsEditingEmail={setIsEditingEmail}
              setIsEditingPassword={setIsEditingPassword}
              setPhoneValue={setPhoneValue}
              setEmailValue={setEmailValue}
              setPasswordValue={setPasswordValue}
              handleProfileUpdate={handleProfileUpdate}
              cancelEdit={cancelEdit}
            />
          )}
        </main>
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Order Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelReject}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Yes, Reject Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}