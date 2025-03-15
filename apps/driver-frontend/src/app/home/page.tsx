"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
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

interface Order {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "pickup" | "delivered";
  deliveryTime?: string;
}

export default function DriverHomepage() {
  const [selectedMenu, setSelectedMenu] = useState("pending-orders");
  
  // Orders that have been accepted and are in various states (pending, pickup, delivered)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([
    { id: "1", name: "Order 1", status: "pending" },
    { id: "2", name: "Order 2", status: "pending" },
    { id: "3", name: "Order 3", status: "pending" },
  ]);
  
  // Orders waiting for accept/reject decision
  const [ordersToReview, setOrdersToReview] = useState<Order[]>([
    { id: "123", name: "Order #123", description: "Pickup from ABC Store, Deliver to XYZ Location", status: "pending" },
    { id: "234", name: "Order #234", description: "Pickup from DEF Store, Deliver to WXY Location", status: "pending" },
  ]);

  const [alertOpen, setAlertOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState<string | null>(null);
  
  const handleAccept = (id: string) => {
    const orderIndex = ordersToReview.findIndex(order => order.id === id);
    
    if (orderIndex !== -1) {
      const orderToAccept = ordersToReview[orderIndex];
      
      setPendingOrders(prevOrders => [...prevOrders, orderToAccept]);
      
      setOrdersToReview(prevOrders => prevOrders.filter((_, index) => index !== orderIndex));
      
      setSelectedMenu("pending-orders");
    }
  };

  const initiateReject = (id: string) => {
    setOrderToReject(id);
    setAlertOpen(true);
  };

  const confirmReject = () => {
    if (orderToReject) {
      setOrdersToReview(prevOrders => prevOrders.filter(order => order.id !== orderToReject));
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
        order.id === id ? { ...order, status: "pickup" } : order
      )
    );
  };

  const handleDelivered = (id: string) => {
    // set delivery time to current time
    const currentTimestamp = new Date().toLocaleString();
    setPendingOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? { ...order, status: "delivered", deliveryTime: currentTimestamp }
          : order
      )
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
                    <Archive size={18} /> Pending Orders {pendingOrders.length > 0 && `(${pendingOrders.length})`}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="block">
                  <SidebarMenuButton
                    className={`flex items-center gap-2 ${selectedMenu === "accept-reject-order" ? "text-dark-blue-700 font-bold" : "text-black"}`}
                    onClick={() => setSelectedMenu("accept-reject-order")}
                  >
                    <CheckCircle size={18} /> Accept/Reject Order {ordersToReview.length > 0 && `(${ordersToReview.length})`}
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
        <main className="flex-1 p-0">
          {selectedMenu === "pending-orders" ? (
            <PendingOrdersWrapper 
              orders={pendingOrders} 
              handlePickup={handlePickup}
              handleDelivered={handleDelivered}
            />
          ) : (
            <AcceptRejectOrderWrapper 
              orders={ordersToReview}
              handleAccept={handleAccept}
              handleReject={initiateReject}
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
              Are you sure you want to reject this order? This action cannot be undone.
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

// PendingOrders component
function PendingOrdersWrapper({ 
  orders, 
  handlePickup, 
  handleDelivered 
}: { 
  orders: Order[], 
  handlePickup: (id: string) => void,
  handleDelivered: (id: string) => void
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Pending Orders</h2>
      <div className="mt-4">
        {orders.map((order) => (
          <div key={order.id} className="p-4 border-b">
            <p>{order.name}</p>
            {order.description && <p className="text-sm text-gray-600">{order.description}</p>}
            {order.status !== "delivered" ? (
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={() => handlePickup(order.id)}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400"
                  disabled={order.status === "pickup" || order.status === "delivered"} 
                >
                  <Archive size={18} /> Pickup
                </Button>
                <Button
                  onClick={() => handleDelivered(order.id)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500"
                  disabled={order.status !== "pickup"} 
                >
                  <CheckCircle size={18} /> Delivered
                </Button>
              </div>
            ) : (
              <div className="mt-4 text-green-600">
                <p className="font-semibold">Delivery Completed for {order.name}</p>
                <p className="text-sm text-gray-600">Delivered at: {order.deliveryTime}</p>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No pending orders available.
          </div>
        )}
      </div>
    </div>
  );
}

// AcceptRejectOrder component
function AcceptRejectOrderWrapper({ 
  orders, 
  handleAccept, 
  handleReject 
}: { 
  orders: Order[], 
  handleAccept: (id: string) => void,
  handleReject: (id: string) => void
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Accept or Reject Order</h2>
      <div className="mt-4">
        {orders.map((order) => (
          <div key={order.id} className="p-4 border-b">
            <p>{order.description || order.name}</p>
            <div className="flex gap-4 mt-4">
              <Button 
                onClick={() => handleAccept(order.id)} 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500"
              >
                <CheckCircle size={18} /> Accept
              </Button>
              <Button 
                onClick={() => handleReject(order.id)} 
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500"
              >
                <XCircle size={18} /> Reject
              </Button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders to review at this time.
          </div>
        )}
      </div>
    </div>
  );
}