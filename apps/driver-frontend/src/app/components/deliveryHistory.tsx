"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown, Eye, Search } from "lucide-react";

import { authClient } from "@repo/auth-client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Skeleton } from "@repo/ui/skeleton";
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

export default function DeliveryHistory() {
  const [deliveryHistory, setDeliveryHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("delivered");
  const itemsPerPage = 10;
  const { useSession } = authClient;
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveryHistoryForTab();
  }, [session, activeTab]);

  const fetchDeliveryHistoryForTab = async () => {
    if (!session?.user?.id) {
      console.error("Session not found or user ID missing.");
      return;
    }

    setLoading(true);
    try {
      // Get assignments directly using the assignment service
      // This follows the same pattern as in driverDashboard.tsx
      const enrichedAssignments = await getEnrichedDriverAssignments(
        session.user.id,
        activeTab.toUpperCase(),
      );

      console.log(
        `Received ${enrichedAssignments.length} enriched assignments for ${activeTab} tab`,
      );
      setDeliveryHistory(enrichedAssignments);

      // Reset pagination when tab changes
      setCurrentPage(1);
    } catch (error) {
      console.error(`Failed to fetch ${activeTab} delivery history:`, error);
      toast({
        title: "Error",
        description: `Could not load your delivery history. Please try again.`,
        variant: "destructive",
      });
      setDeliveryHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term, status, and date
  const filteredOrders = deliveryHistory.filter((order) => {
    // Skip items without order details
    if (!order.orderDetails) return false;

    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderDetails?.id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.orderDetails?.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.orderDetails?.pickupAddress || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.orderDetails?.deliveryAddress || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.orderDetails?.pickupContact || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.orderDetails?.deliveryContact || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (order.orderDetails?.status || "").toLowerCase() ===
        statusFilter.toLowerCase() ||
      order.orderStatus.toLowerCase() === statusFilter.toLowerCase();

    let matchesDate = true;
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      const dateStr = order.orderDetails?.createdAt || order.createdAt || "";
      matchesDate = dateStr.includes(String(today));
    } else if (dateFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const orderDate = new Date(
        order.orderDetails?.createdAt || order.createdAt || "",
      );
      matchesDate = orderDate >= oneWeekAgo;
    } else if (dateFilter === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const orderDate = new Date(
        order.orderDetails?.createdAt || order.createdAt || "",
      );
      matchesDate = orderDate >= oneMonthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (delivery: any) => {
    setSelectedDelivery(delivery);
    setIsDetailsOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "delivered") return "success";
    if (statusLower === "picked_up") return "warning";
    if (statusLower === "driver_found") return "default";
    return "outline";
  };

  const getStatusDisplayName = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "Delivered";
      case "PICKED_UP":
        return "Picked Up";
      case "DRIVER_FOUND":
        return "Driver Assigned";
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Delivery History</h1>
          <Button
            variant="outline"
            onClick={fetchDeliveryHistoryForTab}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        <Tabs
          defaultValue="delivered"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="picked_up">In Progress</TabsTrigger>
            <TabsTrigger value="driver_found">Assigned</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="flex flex-col space-y-4 p-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                <Input
                  placeholder="Search by order ID, details, contact or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by date" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "delivered"
                ? "Completed Deliveries"
                : activeTab === "picked_up"
                  ? "In-Progress Deliveries"
                  : "Assigned Deliveries"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-4">
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ))}
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
                      <TableHead>
                        {activeTab === "delivered"
                          ? "Delivery Date"
                          : "Created Date"}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.length > 0 ? (
                      paginatedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderDetails?.id || order.orderId}
                          </TableCell>
                          <TableCell>
                            {order.orderDetails?.description || "No details"}
                          </TableCell>
                          <TableCell>
                            {order.orderDetails?.pickupAddress || ""}
                            {order.orderDetails?.pickupPostalCode
                              ? `, ${order.orderDetails.pickupPostalCode}`
                              : ""}
                          </TableCell>
                          <TableCell>
                            {order.orderDetails?.deliveryAddress || ""}
                            {order.orderDetails?.deliveryPostalCode
                              ? `, ${order.orderDetails.deliveryPostalCode}`
                              : ""}
                          </TableCell>
                          <TableCell>
                            {formatDate(
                              order.updatedAt || order.createdAt || "",
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                getStatusBadgeVariant(order.orderStatus) as any
                              }
                            >
                              {getStatusDisplayName(order.orderStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-4 text-center">
                          {loading ? "Loading..." : "No delivery history found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={
                      currentPage === 1
                        ? undefined
                        : () => setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* First page */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageOffset = currentPage > 2 ? currentPage - 1 : 1;
                  const pageNumber = pageOffset + i;

                  if (pageNumber > totalPages) return null;

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={pageNumber === currentPage}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {currentPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={
                      currentPage === totalPages
                        ? undefined
                        : () =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                    }
                    aria-disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Delivery Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delivery Details</DialogTitle>
              <DialogDescription>
                Order ID:{" "}
                {selectedDelivery?.orderDetails?.id ||
                  selectedDelivery?.orderId ||
                  ""}
              </DialogDescription>
            </DialogHeader>
            {selectedDelivery && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge
                      className="mt-1 block"
                      variant={
                        getStatusBadgeVariant(
                          selectedDelivery.orderStatus,
                        ) as any
                      }
                    >
                      {getStatusDisplayName(selectedDelivery.orderStatus)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <p className="text-sm">
                      {formatDate(
                        selectedDelivery.updatedAt ||
                          selectedDelivery.createdAt ||
                          "",
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">
                    {selectedDelivery.orderDetails?.description ||
                      "No description available"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Pickup Information
                    </Label>
                    <div className="rounded-lg border p-3 text-sm">
                      <p>
                        <strong>Address:</strong>{" "}
                        {selectedDelivery.orderDetails?.pickupAddress ||
                          "Not available"}
                      </p>
                      <p>
                        <strong>Postal Code:</strong>{" "}
                        {selectedDelivery.orderDetails?.pickupPostalCode ||
                          "Not available"}
                      </p>
                      {selectedDelivery.orderDetails?.pickupContact && (
                        <p>
                          <strong>Contact:</strong>{" "}
                          {selectedDelivery.orderDetails.pickupContact}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Delivery Information
                    </Label>
                    <div className="rounded-lg border p-3 text-sm">
                      <p>
                        <strong>Address:</strong>{" "}
                        {selectedDelivery.orderDetails?.deliveryAddress ||
                          "Not available"}
                      </p>
                      <p>
                        <strong>Postal Code:</strong>{" "}
                        {selectedDelivery.orderDetails?.deliveryPostalCode ||
                          "Not available"}
                      </p>
                      {selectedDelivery.orderDetails?.deliveryContact && (
                        <p>
                          <strong>Contact:</strong>{" "}
                          {selectedDelivery.orderDetails.deliveryContact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {(selectedDelivery.orderDetails?.packageSize ||
                  selectedDelivery.orderDetails?.packageWeight) && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {selectedDelivery.orderDetails?.packageSize && (
                      <div>
                        <Label className="text-sm font-medium">
                          Package Size
                        </Label>
                        <p className="text-sm">
                          {selectedDelivery.orderDetails.packageSize}
                        </p>
                      </div>
                    )}
                    {selectedDelivery.orderDetails?.packageWeight && (
                      <div>
                        <Label className="text-sm font-medium">
                          Package Weight
                        </Label>
                        <p className="text-sm">
                          {selectedDelivery.orderDetails.packageWeight}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedDelivery.orderDetails?.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm">
                      {selectedDelivery.orderDetails.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Created At</Label>
                    <p className="text-sm">
                      {formatDate(selectedDelivery.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm">
                      {formatDate(selectedDelivery.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
