"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import type { Order } from "@repo/db-order/zod";
import { Button } from "@repo/ui/button";

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "displayId",
    header: "Order ID",
    enableColumnFilter: true,
  },

  {
    accessorKey: "orderDetails",
    header: "Order Details",
    enableColumnFilter: true,
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
    cell: ({ row }) => {
      const status = row.original.orderStatus;

      const statusColors: Record<string, string> = {
        PROCESSING: "bg-gray-200 text-gray-800",
        FINDING_DRIVER: "bg-yellow-100 text-yellow-800",
        DRIVER_FOUND: "bg-blue-100 text-blue-800",
        PICKED_UP: "bg-indigo-100 text-indigo-800",
        DELIVERED: "bg-green-100 text-green-800",
        DELAYED: "bg-red-100 text-red-800",
        PAYMENT_PENDING: "bg-orange-100 text-orange-800",
        PAYMENT_FAILED: "bg-red-200 text-red-900",
        PAYMENT_SUCCESSFUL: "bg-green-200 text-green-900",
      };

      return (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status] ?? "bg-gray-100 text-gray-800"}`}
        >
          {status.replaceAll("_", " ")}
        </span>
      );
    },
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
];
