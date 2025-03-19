"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Archive,
  CheckCircle,
  Edit,
  Lock,
  Mail,
  Phone,
  Save,
  User,
  XCircle,
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
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@repo/ui/form";

import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
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

export default function DriverHomepage() {
  const [selectedMenu, setSelectedMenu] = useState("pending-orders");

  // Orders that have been accepted and are in various states (pending, pickup, delivered)
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

  // Orders waiting for accept/reject decision
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

  // Driver profile state
  const [driverProfile, setDriverProfile] = useState<DriverProfile>({
    driverId: "DRV-10025",
    phone: "+1 (555) 123-4567",
    email: "driver@vannova.com",
    password: "••••••••",
    updatedAt: new Date().toISOString(),
  });

  // Edit mode states
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Temporary form values
  const [phoneValue, setPhoneValue] = useState(driverProfile.phone);
  const [emailValue, setEmailValue] = useState(driverProfile.email);
  const [passwordValue, setPasswordValue] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState<string | null>(null);

  // Update handler for profile fields
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
        password: "••••••••", // Always display masked password
        updatedAt: currentTime,
      }));
      setPasswordValue("");
      setIsEditingPassword(false);
    }
  };

  // Reset form fields when canceling edit
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
    // set delivery time to current time
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

// PendingOrders component
// PendingOrders component with table view
function PendingOrdersWrapper({
  orders,
  handlePickup,
  handleDelivered,
}: {
  orders: Order[];
  handlePickup: (id: string) => void;
  handleDelivered: (id: string) => void;
}) {
  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Pending Orders</h2>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left font-medium text-gray-700">
                  Order ID
                </th>
                <th className="border p-3 text-left font-medium text-gray-700">
                  Description
                </th>
                <th className="border p-3 text-left font-medium text-gray-700">
                  Status
                </th>
                <th className="border p-3 text-left font-medium text-gray-700">
                  Delivery Time
                </th>
                <th className="border p-3 text-left font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3">{order.name}</td>
                  <td className="border p-3 text-sm text-gray-600">
                    {order.description ?? "No description provided"}
                  </td>
                  <td className="border p-3">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "pickup"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="border p-3 text-sm">
                    {order.deliveryTime ?? "Not delivered yet"}
                  </td>
                  <td className="border p-3">
                    {order.status !== "delivered" ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePickup(order.id)}
                          className="flex h-auto items-center gap-1 bg-yellow-500 px-2 py-1 text-xs hover:bg-yellow-400"
                          disabled={order.status === "pickup"}
                        >
                          <Archive size={14} /> Pickup
                        </Button>
                        <Button
                          onClick={() => handleDelivered(order.id)}
                          className="flex h-auto items-center gap-1 bg-green-600 px-2 py-1 text-xs hover:bg-green-500"
                          disabled={order.status !== "pickup"}
                        >
                          <CheckCircle size={14} /> Delivered
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-green-600">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-md border bg-gray-50 py-8 text-center text-gray-500">
          <p className="text-lg">No pending orders available.</p>
          <p className="text-sm">
            New orders will appear here when assigned to you.
          </p>
        </div>
      )}
    </div>
  );
}

// AcceptRejectOrder component
function AcceptRejectOrderWrapper({
  orders,
  handleAccept,
  handleReject,
}: {
  orders: Order[];
  handleAccept: (id: string) => void;
  handleReject: (id: string) => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Accept or Reject Order</h2>
      <div className="mt-4">
        {orders.map((order) => (
          <div key={order.id} className="border-b p-4">
            <p>{order.description ?? order.name}</p>
            <div className="mt-4 flex gap-4">
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
          <div className="py-8 text-center text-gray-500">
            No orders to review at this time.
          </div>
        )}
      </div>
    </div>
  );
}

// ProfileManagement component
function ProfileManagementWrapper({
  profile,
  isEditingPhone,
  isEditingEmail,
  isEditingPassword,
  phoneValue,
  emailValue,
  passwordValue,
  setIsEditingPhone,
  setIsEditingEmail,
  setIsEditingPassword,
  setPhoneValue,
  setEmailValue,
  setPasswordValue,
  handleProfileUpdate,
  cancelEdit,
}: {
  profile: DriverProfile;
  isEditingPhone: boolean;
  isEditingEmail: boolean;
  isEditingPassword: boolean;
  phoneValue: string;
  emailValue: string;
  passwordValue: string;
  setIsEditingPhone: (value: boolean) => void;
  setIsEditingEmail: (value: boolean) => void;
  setIsEditingPassword: (value: boolean) => void;
  setPhoneValue: (value: string) => void;
  setEmailValue: (value: string) => void;
  setPasswordValue: (value: string) => void;
  handleProfileUpdate: (field: "phone" | "email" | "password") => void;
  cancelEdit: (field: "phone" | "email" | "password") => void;
}) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-semibold">Profile Management</h2>

      <div className="mb-6 rounded-lg border bg-white shadow-sm">
        <div className="border-b p-6">
          <h3 className="text-lg font-medium">Driver Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            View and update your profile information.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Driver ID (Read-only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="driverId" className="text-sm font-medium">
                Driver ID
              </Label>
              <span className="text-xs text-gray-500">(Cannot be changed)</span>
            </div>
            <div className="flex items-center space-x-2 rounded-md border bg-gray-50 p-2">
              <User size={18} className="text-gray-500" />
              <Input
                id="driverId"
                value={profile.driverId}
                disabled
                className="border-0 bg-transparent p-0 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Phone Number (Editable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              {!isEditingPhone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-blue-600"
                  onClick={() => setIsEditingPhone(true)}
                >
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-2">
              <Phone size={18} className="text-gray-500" />
              {isEditingPhone ? (
                <div className="flex-1">
                  <Input
                    id="phone"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    className="border-0 p-0 focus-visible:ring-0"
                    autoFocus
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEdit("phone")}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleProfileUpdate("phone")}
                    >
                      <Save size={16} className="mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  id="phone"
                  value={profile.phone}
                  disabled
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              )}
            </div>
          </div>

          {/* Email (Editable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              {!isEditingEmail && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-blue-600"
                  onClick={() => setIsEditingEmail(true)}
                >
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-2">
              <Mail size={18} className="text-gray-500" />
              {isEditingEmail ? (
                <div className="flex-1">
                  <Input
                    id="email"
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="border-0 p-0 focus-visible:ring-0"
                    autoFocus
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEdit("email")}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleProfileUpdate("email")}
                    >
                      <Save size={16} className="mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              )}
            </div>
          </div>

          {/* Password (Editable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              {!isEditingPassword && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-blue-600"
                  onClick={() => setIsEditingPassword(true)}
                >
                  <Edit size={16} className="mr-1" /> Change Password
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-2">
              <Lock size={18} className="text-gray-500" />
              {isEditingPassword ? (
                <div className="flex-1">
                  <Input
                    id="password"
                    type="password"
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    className="border-0 p-0 focus-visible:ring-0"
                    placeholder="Enter new password"
                    autoFocus
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEdit("password")}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleProfileUpdate("password")}
                    >
                      <Save size={16} className="mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  id="password"
                  type="password"
                  value={profile.password}
                  disabled
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              )}
            </div>
          </div>
        </div>

        <div className="border-t p-4 text-sm text-gray-500">
          <p>Profile last updated: {formatDate(profile.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
