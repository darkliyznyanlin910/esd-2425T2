"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  MapPinCheck,
  MapPinned,
  Package,
  Truck,
  X,
} from "lucide-react";

import type { Order, OrderTrackingRecord } from "@repo/db-order/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";

interface OrderTrackingRecordDetails {
  orderId: string;
  status: string;
  createdAt: Date;
}

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderTrackingModal({
  order,
  onClose,
}: OrderTrackingModalProps) {
  const [trackingRecords, setTrackingRecords] = useState<
    OrderTrackingRecordDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!order) return;

    async function fetchTrackingRecords() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${getServiceBaseUrl("order")}/order/tracking/${order?.id}`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch tracking records: ${response.status}`,
          );
        }

        const data = (await response.json()) as OrderTrackingRecord[];
        data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setTrackingRecords(data);

        //         const mockData: OrderTrackingRecord[] = [
        //           {
        //             id: "mock-1",
        //             orderId: "1",
        //             status: "PAYMENT_FAILED",
        //             createdAt: new Date(new Date().getTime() - 45 * 60000),
        //             updatedAt: new Date(new Date().getTime() - 45 * 60000),
        //             description: "Searching for available drivers...",
        //           },
        // {
        //   id: "mock-2",
        //   orderId: "1",
        //   status: "PAYMENT_SUCCESSFUL",
        //   createdAt: new Date(new Date().getTime() - 30 * 60000),
        //   updatedAt: new Date(new Date().getTime() - 30 * 60000),
        //   description: "Driver assigned to the order.",
        // },
        // {
        //   id: "mock-3",
        //   orderId: "1",
        //   status: "FINDING_DRIVER",
        //   createdAt: new Date(new Date().getTime() - 10 * 60000),
        //   updatedAt: new Date(new Date().getTime() - 10 * 60000),
        //   description: "Package picked up by driver.",
        // },
        // {
        //   id: "mock-4",
        //   orderId: "2",
        //   status: "PAYMENT_PENDING",
        //   createdAt: new Date(new Date().getTime() - 90 * 60000),
        //   updatedAt: new Date(new Date().getTime() - 90 * 60000),
        //   description: "Searching for available drivers...",
        // },
        // {
        //   id: "mock-5",
        //   orderId: "2",
        //   status: "PAYMENT_SUCCESSFUL",
        //   createdAt: new Date(new Date().getTime() - 80 * 60000),
        //   updatedAt: new Date(new Date().getTime() - 80 * 60000),
        //   description: "Driver assigned to the order.",
        // },
        // {
        //   id: "mock-6",
        //   orderId: "2",
        //   status: "FINDING_DRIVER",
        //   createdAt: new Date(new Date().getTime() - 75 * 60000),
        //   updatedAt: new Date(new Date().getTime() - 75 * 60000),
        //   description: "Package picked up by driver.",
        // },
        // {
        //   id: "mock-7",
        //   orderId: "2",
        //   status: "DELAYED",
        //   createdAt: new Date(new Date().getTime() - 70 * 60000),
        //   updatedAt: new Date(new Date().getTime() - 70 * 60000),
        //   description: "Package picked up by driver.",
        // },
        //         ];

        //         const filteredData = mockData
        //           .filter((record) => record.orderId === order?.id)
        //           .sort(
        //             (a, b) =>
        //               new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        //           );
        //         setTrackingRecords(filteredData);
      } catch (err) {
        console.error("Error fetching tracking records:", err);
        setError("Failed to load tracking information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchTrackingRecords();
  }, [order]);

  if (!order) return null;

  const currentStatus =
    trackingRecords.length > 0
      ? (trackingRecords[0]?.status ?? order.orderStatus)
      : order.orderStatus;

  const getStatusStep = (status: string) => {
    const statusMap: Record<string, number> = {
      PROCESSING: 1,
      PAYMENT_SUCCESSFUL: 1,
      PAYMENT_PENDING: 1,
      PAYMENT_FAILED: 1,
      FINDING_DRIVER: 2,
      DRIVER_FOUND: 3,
      PICKED_UP: 4,
      DELIVERED: 5,
      DELAYED: 2,
    };
    return statusMap[status] ?? 1;
  };

  const currentStep = getStatusStep(currentStatus);
  const isDelayed = currentStatus === "DELAYED";

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  };

  const getEstimatedDelivery = () => {
    if (currentStatus === "DELIVERED") {
      const deliveredRecord = trackingRecords.find(
        (record) => record.status === "DELIVERED",
      );
      return deliveredRecord
        ? formatDate(new Date(deliveredRecord.createdAt))
        : "Delivered";
    }

    const deliveryDate = new Date();
    deliveryDate.setHours(deliveryDate.getHours() + 4);
    return formatDate(deliveryDate);
  };

  const latestRecord = trackingRecords.length > 0 ? trackingRecords[0] : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white shadow-xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
            <h2 className="text-xl font-bold">
              Order {order.displayId} Tracking
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
              aria-label="Close tracking modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading tracking information...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-64 flex-col items-center justify-center">
                <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                <p className="text-center text-red-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`mb-6 rounded-lg p-4 ${
                    currentStatus === "DELIVERED"
                      ? "bg-green-50 text-green-700"
                      : isDelayed
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {currentStatus === "DELIVERED" ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : isDelayed ? (
                      <AlertCircle className="h-6 w-6" />
                    ) : (
                      <Clock className="h-6 w-6" />
                    )}
                    <div>
                      <h3 className="font-medium">
                        {currentStatus === "DELIVERED"
                          ? "Delivered"
                          : isDelayed
                            ? "Delivery Delayed"
                            : "Estimated Delivery"}
                      </h3>
                      <p className="text-sm">
                        {currentStatus === "DELIVERED"
                          ? getEstimatedDelivery()
                          : isDelayed
                            ? "We're working to get your package to you as soon as possible"
                            : getEstimatedDelivery()}
                      </p>
                      {latestRecord && (
                        <p className="mt-1 text-xs opacity-80">
                          Last status update:{" "}
                          {formatDate(new Date(latestRecord.createdAt))}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium">Package Details</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.orderDetails}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium">Order Information</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Order ID: {order.displayId}</p>
                      <p>Created: {formatDate(order.createdAt)}</p>
                      <p>Last Updated: {formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPinCheck className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium">Pickup Address</h3>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{order.fromAddressLine1}</p>
                      {order.fromAddressLine2 && (
                        <p>{order.fromAddressLine2}</p>
                      )}
                      <p>ZIP: {order.fromZipCode}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium">Delivery Address</h3>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{order.toAddressLine1}</p>
                      {order.toAddressLine2 && <p>{order.toAddressLine2}</p>}
                      <p>ZIP: {order.toZipCode}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 font-medium">Delivery Progress</h3>
                  <div className="relative mb-8">
                    <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200"></div>
                    <div
                      className={`absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-blue-600 transition-all duration-500 ${
                        isDelayed ? "bg-amber-500" : ""
                      }`}
                      style={{
                        width: `${Math.min(100, (currentStep / 5) * 100)}%`,
                      }}
                    ></div>
                    <div className="relative flex justify-between">
                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                            currentStep >= 1
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="mt-2 text-center text-xs">
                          Processing
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                            isDelayed
                              ? "border-amber-500 bg-amber-500 text-white"
                              : currentStep >= 2
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-300 bg-white"
                          }`}
                        >
                          {isDelayed ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <span className="mt-2 text-center text-xs">
                          {isDelayed ? "Delayed" : "Finding Driver"}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                            currentStep >= 3
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          <Truck className="h-4 w-4" />
                        </div>
                        <span className="mt-2 text-center text-xs">
                          Driver Found
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                            currentStep >= 4
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="mt-2 text-center text-xs">
                          Picked Up
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                            currentStep >= 5
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <span className="mt-2 text-center text-xs">
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-medium">Tracking History</h3>
                  {trackingRecords.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No tracking information available yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {trackingRecords.map((record, index) => (
                        <div
                          key={index}
                          className="flex gap-3 border-l-2 border-blue-600 pl-3"
                        >
                          <div className="min-w-[180px] text-xs text-gray-500">
                            {formatDate(record.createdAt)}
                          </div>
                          <div className="flex flex-col">
                            <div className="text-sm font-medium">
                              Status:{" "}
                              <span className="font-bold">
                                {record.status.replaceAll("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="sticky bottom-0 border-t bg-gray-50 p-4">
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
