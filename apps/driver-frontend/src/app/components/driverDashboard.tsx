"use client";

import { useEffect, useState } from "react";
import { Car, CheckCircle, Package, RefreshCcw } from "lucide-react";

import { authClient } from "@repo/auth-client";
import { Order } from "@repo/db-order/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { useToast } from "@repo/ui/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

import { getEnrichedDriverAssignments } from "../services/assignmentService";
import NotificationComponent from "./notification";

// Add these helper functions outside your component
const getAcceptedOrdersFromStorage = (): Set<string> => {
  if (typeof window === "undefined") return new Set();

  const stored = localStorage.getItem("acceptedOrderIds");
  if (!stored) return new Set();

  try {
    return new Set(JSON.parse(stored));
  } catch (error) {
    console.error("Error parsing accepted orders from storage:", error);
    return new Set();
  }
};

const saveAcceptedOrdersToStorage = (orderIds: Set<string>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("acceptedOrderIds", JSON.stringify([...orderIds]));
};

export default function DriverDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pickupOrder, setPickupOrder] = useState<any[]>([]);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [deliveryOrder, setDeliveryOrder] = useState<any[]>([]);
  const { useSession } = authClient;
  const { data: session } = useSession();
  const [disabledButtons, setDisabledButtons] = useState<{
    [key: string]: boolean;
  }>({});
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const [acceptingOrderIds, setAcceptingOrderIds] = useState<string[]>([]);
  // Use localStorage for persistence
  const [acceptedOrderIds, setAcceptedOrderIds] = useState<Set<string>>(() =>
    getAcceptedOrdersFromStorage(),
  );

  // First, let's add separate refresh states for each tab
  const [isRefreshingAvailable, setIsRefreshingAvailable] = useState(false);
  const [isRefreshingPickup, setIsRefreshingPickup] = useState(false);
  const [isRefreshingDelivery, setIsRefreshingDelivery] = useState(false);

  // Update localStorage when acceptedOrderIds changes
  useEffect(() => {
    saveAcceptedOrdersToStorage(acceptedOrderIds);
  }, [acceptedOrderIds]);

  const handleAcceptOrder = async (orderId: string) => {
    setDisabledButtons((prev) => ({ ...prev, [orderId]: true }));
    setHasNewOrder(false);

    // Track that this driver is accepting this order
    setAcceptingOrderIds((prev) => [...prev, orderId]);

    // Track this order ID as being accepted by this driver
    setAcceptedOrderIds((prev) => new Set([...prev, orderId]));

    try {
      const response = await fetch(
        `${getServiceBaseUrl("driver")}/driver/state/DRIVER_FOUND`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            driverId: session?.user.id,
          }),
        },
      );
      if (response.ok) {
        toast({
          title: "Order Accepted",
          description: "You have successfully accepted the order.",
          variant: "success",
          duration: 3000,
        });

        // Add this order to pickup orders list
        const acceptedOrder = orders.find((order) => order.id === orderId);
        if (acceptedOrder) {
          setPickupOrder((prev) => [...prev, acceptedOrder]);

          // Remove from available orders
          setOrders((prev) => prev.filter((order) => order.id !== orderId));
        }
      }
      if (!session?.user.id) {
        console.error("Session user ID is not available.");
        return;
      }
      try {
        const url = new URL(
          `${getServiceBaseUrl("driver")}/driver/assignments/${session.user.id}`,
        );
        url.searchParams.append("status", "DRIVER_FOUND");
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Pickup order data:", data);
          setPickupOrder(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch pickup orders:", error);
      }
      try {
        const response = await fetch(
          `${getServiceBaseUrl("order")}/order/finding/initialOrders`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Available order data:", data);
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
      await fetchPickupOrders();
      await fetchAvailableOrders();
    } catch (error) {
      console.error("Failed to accept order:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to accept order. Please try again.",
        duration: 3000,
      });

      // Remove from accepted set if there was an error
      setAcceptedOrderIds((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(orderId);
        return newSet;
      });
    } finally {
      setDisabledButtons((prev) => ({ ...prev, [orderId]: false }));

      // Remove from the accepting list after a delay (to ensure we don't
      // process our own invalidation message that might arrive after acceptance)
      setTimeout(() => {
        setAcceptingOrderIds((prev) => prev.filter((id) => id !== orderId));
      }, 5000); // 5 second delay
    }
  };

  const handlePickupOrder = async (orderId: string) => {
    try {
      const response = await fetch(
        `${getServiceBaseUrl("driver")}/driver/state/PICKED_UP`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            driverId: session?.user.id,
          }),
        },
      );
      if (response.ok) {
        toast({
          title: "Order Picked Up",
          variant: "success",
          description: "You have successfully picked the order up.",
          duration: 3000,
        });
      }
      if (!session?.user.id) return;
      try {
        const url = new URL(
          `${getServiceBaseUrl("driver")}/driver/assignments/${session.user.id}`,
        );
        url.searchParams.append("status", "DRIVER_FOUND");
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPickupOrder(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch pickup orders:", error);
      }
      try {
        const url = new URL(
          `${getServiceBaseUrl("driver")}/driver/assignments/${session.user.id}`,
        );
        url.searchParams.append("status", "PICKED_UP");
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Delivery order data:", data);
          setDeliveryOrder(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch delivery orders:", error);
      }
      await fetchPickupOrders();
      await fetchDeliveryOrders();
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to pick order up. Please try again.",
        duration: 3000,
      });
    } finally {
      setDisabledButtons((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDeliveryOrder = async (orderId: string) => {
    try {
      const response = await fetch(
        `${getServiceBaseUrl("driver")}/driver/state/DELIVERED`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            driverId: session?.user.id,
          }),
        },
      );
      if (response.ok) {
        toast({
          title: "Order Delivered",
          variant: "success",
          description: "You have successfully delivered the order.",
          duration: 3000,
        });
      }
      if (!session?.user.id) return;

      try {
        const url = new URL(
          `${getServiceBaseUrl("driver")}/driver/assignments/${session.user.id}`,
        );
        url.searchParams.append("status", "PICKED_UP");
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Delivery order data:", data);
          setDeliveryOrder(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch delivery orders:", error);
      }
      await fetchDeliveryOrders();
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to deliver the order. Please try again.",
        duration: 3000,
      });
    } finally {
      setDisabledButtons((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Then let's create separate fetch functions for each tab
  const fetchAvailableOrders = async () => {
    setIsRefreshingAvailable(true);
    try {
      const response = await fetch(
        `${getServiceBaseUrl("order")}/order/finding/initialOrders`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
        setHasNewOrder(false);
        setNewOrderIds([]);
        toast({
          title: "Available Orders Refreshed",
          description: "Available orders list has been updated.",
          variant: "success",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Failed to fetch available orders:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh available orders. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshingAvailable(false);
    }
  };

  const fetchPickupOrders = async () => {
    if (!session?.user.id) return;

    setIsRefreshingPickup(true);
    try {
      const enrichedAssignments = await getEnrichedDriverAssignments(
        session.user.id,
        "DRIVER_FOUND",
      );

      setPickupOrder(enrichedAssignments);

      toast({
        title: "Pickup Orders Refreshed",
        description: "Your orders to pick up have been updated.",
        variant: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to fetch pickup orders:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh pickup orders. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshingPickup(false);
    }
  };

  const fetchDeliveryOrders = async () => {
    if (!session?.user.id) return;

    setIsRefreshingDelivery(true);
    try {
      const enrichedAssignments = await getEnrichedDriverAssignments(
        session.user.id,
        "PICKED_UP",
      );

      setDeliveryOrder(enrichedAssignments);

      toast({
        title: "Delivery Orders Refreshed",
        description: "Your orders to deliver have been updated.",
        variant: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to fetch delivery orders:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh delivery orders. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshingDelivery(false);
    }
  };

  // Update the fetchOrders function to call all three fetch functions
  const fetchAllOrders = async () => {
    await Promise.all([
      fetchAvailableOrders(),
      fetchPickupOrders(),
      fetchDeliveryOrders(),
    ]);
  };

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `${getServiceBaseUrl("order")}/order/finding/initialOrders`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
        setHasNewOrder(false);
        setNewOrderIds([]);
        toast({
          title: "Orders Refreshed",
          description: "Available orders list has been updated.",
          variant: "success",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh orders. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${getServiceBaseUrl("order")}/order/finding/initialOrders`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    const fetchPickupOrder = async () => {
      if (!session?.user.id) return;

      try {
        const enrichedAssignments = await getEnrichedDriverAssignments(
          session.user.id,
          "DRIVER_FOUND",
        );

        setPickupOrder(enrichedAssignments);
      } catch (error) {
        console.error("Failed to fetch pickup orders:", error);
      }
    };

    const fetchDeliveryOrder = async () => {
      if (!session?.user.id) return;

      try {
        const enrichedAssignments = await getEnrichedDriverAssignments(
          session.user.id,
          "PICKED_UP",
        );

        setDeliveryOrder(enrichedAssignments);
      } catch (error) {
        console.error("Failed to fetch delivery orders:", error);
      }
    };

    fetchOrders();
    fetchPickupOrder();
    fetchDeliveryOrder();
  }, [session]);
  const handleNewOrder = (orderData?: any) => {
    setHasNewOrder(true);

    // If we received order data, track its ID as new
    if (orderData && orderData.id) {
      setNewOrderIds((prev) => [...prev, orderData.id]);
      // Auto-clear the highlight after 30 seconds
      setTimeout(() => {
        setNewOrderIds((prev) => prev.filter((id) => id !== orderData.id));
      }, 30000);
    }

    // If we received order data, add it to the orders list
    if (orderData) {
      setOrders((prevOrders) => {
        // Check if this order already exists in the list
        const orderExists = prevOrders.some(
          (order) => order.id === orderData.id,
        );

        // Only add if it doesn't exist yet
        if (!orderExists) {
          return [...prevOrders, orderData];
        }
        return prevOrders;
      });
    } else {
      // If no order data was passed, refresh the orders list from the API
      fetchOrders();
    }
  };

  const handleInvalidateOrder = (orderId: string) => {
    // Don't invalidate if this driver just accepted this order
    if (acceptingOrderIds.includes(orderId)) {
      console.log(
        "Ignoring invalidation for order being accepted by this driver:",
        orderId,
      );
      return;
    }

    // Check if this driver has accepted this order
    if (acceptedOrderIds.has(orderId)) {
      console.log(
        "Ignoring invalidation for order that this driver accepted:",
        orderId,
      );
      return;
    }

    console.log("Invalidating order in dashboard:", orderId);
    // Rest of your existing invalidation logic...
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId),
    );
    setNewOrderIds((prev) => prev.filter((id) => id !== orderId));
    if (orders.length <= 1 && hasNewOrder) {
      setHasNewOrder(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Mobile Header */}
      <header className="border-b bg-muted p-4 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Car className="h-6 w-6 text-primary" />
            <span className="ml-2 font-semibold">Driver Portal</span>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <NotificationComponent
            onNewOrder={handleNewOrder}
            onInvalidateOrder={handleInvalidateOrder}
            acceptedOrderIds={acceptedOrderIds}
          />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Available Orders
              </CardTitle>
              <CardDescription>Orders you can accept</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">To Pick Up</CardTitle>
              <CardDescription>Orders to collect</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pickupOrder.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">To Deliver</CardTitle>
              <CardDescription>Orders to drop off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryOrder.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue="available"
          className="w-full"
          onValueChange={(value) => {
            if (value === "available") {
              setHasNewOrder(false);
            }
          }}
        >
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="available" className="relative">
              Available Orders
              {hasNewOrder && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pickup">To Pick Up</TabsTrigger>
            <TabsTrigger value="dropoff">To Deliver</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Available Orders</CardTitle>
                  <CardDescription>
                    Orders you can accept for delivery
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchAvailableOrders}
                  disabled={isRefreshingAvailable}
                  title="Refresh available orders list"
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${isRefreshingAvailable ? "animate-spin" : ""}`}
                  />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {isRefreshingAvailable ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">
                        Refreshing available orders...
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Order Details</TableHead>
                          <TableHead>From Address</TableHead>
                          <TableHead>To Address</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((data) => (
                          <TableRow
                            key={data.id}
                            className={
                              newOrderIds.includes(data.id)
                                ? "animate-pulse bg-yellow-50 dark:bg-yellow-900/20"
                                : ""
                            }
                          >
                            <TableCell className="font-medium">
                              {data.displayId}
                            </TableCell>
                            <TableCell>{data.orderDetails}</TableCell>
                            <TableCell>{`${data.fromAddressLine1}, ${data.fromAddressLine2 || ""}, ${data.fromZipCode}`}</TableCell>
                            <TableCell>{`${data.toAddressLine1}, ${data.toAddressLine2 || ""}, ${data.toZipCode}`}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() => handleAcceptOrder(data.id)}
                                size="sm"
                                disabled={disabledButtons[data.id]}
                              >
                                Accept Order
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pickup">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Orders to Pick Up</CardTitle>
                  <CardDescription>
                    Orders you need to collect from first location
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchPickupOrders}
                  disabled={isRefreshingPickup}
                  title="Refresh pickup orders list"
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${isRefreshingPickup ? "animate-spin" : ""}`}
                  />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {isRefreshingPickup ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">
                        Refreshing pickup orders...
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Order Details</TableHead>
                          <TableHead>From Address</TableHead>
                          <TableHead>To Address</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pickupOrder.map((data) => (
                          <TableRow key={data.id}>
                            <TableCell className="font-medium">
                              {data.orderDetails?.displayId}
                            </TableCell>
                            <TableCell>
                              {data.orderDetails?.orderDetails}
                            </TableCell>
                            <TableCell>{`${data.orderDetails?.fromAddressLine1}, ${data.orderDetails?.fromAddressLine2 || ""}, ${data.orderDetails?.fromZipCode}`}</TableCell>
                            <TableCell>{`${data.orderDetails?.toAddressLine1}, ${data.orderDetails?.toAddressLine2 || ""}, ${data.orderDetails?.toZipCode}`}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() => handlePickupOrder(data.orderId)}
                                size="sm"
                                disabled={disabledButtons[data.orderId]}
                              >
                                <Package className="mr-2 h-4 w-4" />
                                Picked Up
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dropoff">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Orders to Deliver</CardTitle>
                  <CardDescription>
                    Orders you need to deliver to second location
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchDeliveryOrders}
                  disabled={isRefreshingDelivery}
                  title="Refresh delivery orders list"
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${isRefreshingDelivery ? "animate-spin" : ""}`}
                  />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {isRefreshingDelivery ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">
                        Refreshing delivery orders...
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Order Details</TableHead>
                          <TableHead>From Address</TableHead>
                          <TableHead>To Address</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveryOrder.map((data) => (
                          <TableRow key={data.id}>
                            <TableCell className="font-medium">
                              {data.orderDetails?.displayId}
                            </TableCell>
                            <TableCell>
                              {data.orderDetails?.orderDetails}
                            </TableCell>
                            <TableCell>{`${data.orderDetails?.fromAddressLine1}, ${data.orderDetails?.fromAddressLine2 || ""}, ${data.orderDetails?.fromZipCode}`}</TableCell>
                            <TableCell>{`${data.orderDetails?.toAddressLine1}, ${data.orderDetails?.toAddressLine2 || ""}, ${data.orderDetails?.toZipCode}`}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() =>
                                  handleDeliveryOrder(data.orderId)
                                }
                                size="sm"
                                disabled={disabledButtons[data.orderId]}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Delivered
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
