"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import type React from "react";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { RefreshCcw } from "lucide-react";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";

import { OrderTrackingModal } from "./order-tracking-modal";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRefresh?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRefresh,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("displayId");
  const [selectedOrder, setSelectedOrder] = useState<TData | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterValue(value);
    table.getColumn(selectedColumn)?.setFilterValue(value);
  };

  const handleRowClick = (row: TData) => {
    setSelectedOrder(row);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between pb-3">
        <div className="flex gap-2 py-2">
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="displayId">Order ID</option>
            <option value="userId">Customer ID</option>
            <option value="orderDetails">Order Details</option>
          </select>
          <Input
            placeholder={`Search by ${
              selectedColumn === "displayId"
                ? "Order ID"
                : selectedColumn === "userId"
                  ? "Customer ID"
                  : selectedColumn === "orderDetails"
                    ? "Order Details"
                    : "Status"
            }`}
            value={filterValue}
            onChange={handleFilterChange}
            className="h-8 max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            onChange={(e) =>
              table
                .getColumn("orderStatus")
                ?.setFilterValue(e.target.value || undefined)
            }
            className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            defaultValue=""
          >
            <option value="">All Statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="FINDING_DRIVER">Finding Driver</option>
            <option value="DRIVER_FOUND">Driver Found</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="DELIVERED">Delivered</option>
            <option value="DELAYED">Delayed</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="PAYMENT_FAILED">Payment Failed</option>
            <option value="PAYMENT_SUCCESSFUL">Payment Successful</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="text-sm"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="w-full rounded-md border">
        <Table>
          <TableHeader className="text-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="min-w-[120px] whitespace-nowrap text-foreground"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="min-w-[120px] whitespace-nowrap text-foreground"
                      key={cell.id}
                      onClick={(e) => {
                        if (
                          (e.target as HTMLElement).closest(
                            "[data-track-order]",
                          )
                        ) {
                          e.stopPropagation();
                          handleRowClick(row.original);
                        }
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mx-auto flex justify-center space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {selectedOrder && (
        <OrderTrackingModal
          order={selectedOrder as any}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
