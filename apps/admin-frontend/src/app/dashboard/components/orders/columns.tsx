"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Order } from "@repo/db-order/zod";
import { Button } from "@repo/ui/button";

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "description",
    header: "Description",
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
];
