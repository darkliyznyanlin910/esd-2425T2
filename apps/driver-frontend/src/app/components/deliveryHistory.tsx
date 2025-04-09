"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { authClient } from "@repo/auth-client";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";

import { getEnrichedDriverAssignments } from "../services/assignmentService";

interface DeliveryHistoryItem {
  id: string;
  driverId: string;
  orderId: string;
  orderStatus: "DELIVERED";
  createdAt: string;
  updatedAt: string;
  orderDetails: {
    id: string;
    displayId: string;
    orderDetails: string;
    orderStatus: string;
    fromAddressLine1: string;
    fromAddressLine2?: string;
    fromZipCode: string;
    toAddressLine1: string;
    toAddressLine2?: string;
    toZipCode: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export default function DeliveryHistory() {
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistoryItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { useSession } = authClient;
  const { data: session } = useSession();

  useEffect(() => {
    const fetchDeliveryHistory = async () => {
      setLoading(true);
      try {
        if (!session?.user?.id) {
          console.error("Session not found or user ID missing.");
          return;
        }

        // Use the enriched assignments service
        const enrichedAssignments = await getEnrichedDriverAssignments(
          session.user.id,
          "DELIVERED",
        );

        if (Array.isArray(enrichedAssignments)) {
          setDeliveryHistory(enrichedAssignments);
        } else {
          console.error("Unexpected response format:", enrichedAssignments);
          setDeliveryHistory([]);
        }
      } catch (error) {
        console.error("Failed to fetch delivery history:", error);
        setDeliveryHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchDeliveryHistory();
    }
  }, [session]);

  // Filter orders based on search term, status, and date
  const filteredOrders = deliveryHistory.filter((order) => {
    // Skip items without order details
    if (!order.orderDetails) return false;

    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderDetails.displayId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.orderDetails.orderDetails
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.orderDetails.fromAddressLine1
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.orderDetails.toAddressLine1
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      order.orderDetails.orderStatus?.toLowerCase() ===
        statusFilter.toLowerCase();

    let matchesDate = true;
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      matchesDate = order.orderDetails.createdAt?.includes(String(today));
    } else if (dateFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const orderDate = new Date(order.orderDetails.createdAt);
      matchesDate = orderDate >= oneWeekAgo;
    } else if (dateFilter === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const orderDate = new Date(order.orderDetails.createdAt);
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

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Delivery History</h1>
        </div>
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="flex flex-col space-y-4 p-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                <Input
                  placeholder="Search by order ID, details, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
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
            <CardTitle>Completed Deliveries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Order Details</TableHead>
                    <TableHead>From Address</TableHead>
                    <TableHead>To Address</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-4 text-center">
                        Loading delivery history...
                      </TableCell>
                    </TableRow>
                  ) : paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderDetails?.displayId || ""}
                        </TableCell>
                        <TableCell>
                          {order.orderDetails?.orderDetails || ""}
                        </TableCell>
                        <TableCell>
                          {`${order.orderDetails?.fromAddressLine1 || ""}, ${
                            order.orderDetails?.fromAddressLine2 || ""
                          }, ${order.orderDetails?.fromZipCode || ""}`}
                        </TableCell>
                        <TableCell>
                          {`${order.orderDetails?.toAddressLine1 || ""}, ${
                            order.orderDetails?.toAddressLine2 || ""
                          }, ${order.orderDetails?.toZipCode || ""}`}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.orderDetails?.createdAt || "")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800"
                          >
                            Delivered
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-4 text-center">
                        No delivery history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}
