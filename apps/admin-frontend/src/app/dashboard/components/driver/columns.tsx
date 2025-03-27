"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { hc } from "hono/client";
import { ArrowUpDown } from "lucide-react";

import { Order } from "@repo/db-order/zod";
import { AppType as DriverAppType } from "@repo/driver/type";
import { AppType as OrderAppType } from "@repo/order/type";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";

import { useOrders } from "./assign-context";
import { SelectionTable } from "./driver-selection";

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "userId",
    header: "Customer",
  },
  {
    header: "From Address",
    cell: ({ row }) => {
      const { fromAddressLine1, fromAddressLine2, fromZipCode } = row.original;
      return `${fromAddressLine1} ${fromAddressLine2} ${fromZipCode}`;
    },
  },
  {
    header: "To Address",
    cell: ({ row }) => {
      const { toAddressLine1, toAddressLine2, toZipCode } = row.original;
      return `${toAddressLine1} ${toAddressLine2} ${toZipCode}`;
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "assign",
    header: "Assign",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const { orders, setOrders } = useOrders();

      const handleAssign = async (
        driverId: string,
        userId: string,
        orderId: string,
        paymentAmount: number,
      ) => {
        try {
          console.log(`Order ${orderId} assigned to driver ${driverId}`);
          setOpen(false);

          // const assignResponse = await hc<DriverAppType>(
          //   getServiceBaseUrl("driver"),
          // ).driver.assign.$post(
          //   {
          //     json: {
          //       driverId,
          //       orderId,
          //       paymentAmount,
          //     },
          //   },
          //   {
          //     init: { credentials: "include" },
          //   },
          // );

          // if (!assignResponse.ok) {
          //   throw new Error("Assign driver failed");
          // }

          // const availabilityResponse = await hc<DriverAppType>(
          //   getServiceBaseUrl("driver"),
          // ).driver[":userId"].availability.$put(
          //   {
          //     param: { userId },
          //     json: {
          //       availability: "ON_DELIVERY",
          //     },
          //   },
          //   {
          //     init: { credentials: "include" },
          //   },
          // );

          // if (!availabilityResponse.ok) {
          //   throw new Error("Update availability failed");
          // }

          // console.log(`Driver ${userId} successfully assigned and updated.`);

          // const state = "DRIVER_FOUND";

          // const updateOrder = await hc<OrderAppType>(
          //   getServiceBaseUrl("order"),
          // ).order.updateStatus[":id"].$post(
          //   {
          //     param: { id: orderId },
          //     json: {
          //       orderStatus: state,
          //     },
          //   },
          //   {
          //     init: {
          //       credentials: "include",
          //       headers: {
          //         "Content-Type": "application/json",
          //       },
          //     },
          //   },
          // );

          // if (!updateOrder.ok) {
          //   throw new Error("Update order failed");
          // }

          // console.log("Order state updated to DRIVER_FOUND");

          setOrders((prevOrders: Order[]) =>
            prevOrders.filter((order: Order) => order.id !== orderId),
          );

      //     const updateTemporal = await hc<DriverAppType>(
      //       getServiceBaseUrl("order"),
      //     ).process.$get(
      //       {
      //         param: { state },
      //         json: { orderId, driverId },
      //       },
      //       {
      //         init: { credentials: "include" },
      //       },
      //     );

      //     if (!updateTemporal.ok) {
      //       throw new Error("Update temporal failed");
      //     }

      //     console.log("Order state updated to DRIVER_FOUND");
      //   } catch (error) {
      //     console.error("Error in handleAssign:", error);
      //   }
      // };
      return (
        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)}>Assign</Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Assign Driver</DialogTitle>
              </DialogHeader>
              <p>Assigning order ID: {row.original.id}</p>
              <SelectionTable
                orderId={row.original.id}
                onAssign={handleAssign}
                paymentAmount={5}
              />
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];
