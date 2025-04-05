"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
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

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div className="flex gap-2 py-4">
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="rounded border border-gray-300 p-2"
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
                  : "Order Details"
            }`}
            value={filterValue}
            onChange={handleFilterChange}
            className="max-w-sm"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="ml-2 mt-4 text-sm"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="w-full rounded-md border">
        <Table>
          <TableHeader className="text-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-foreground" key={header.id}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="text-foreground" key={cell.id}>
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
    </div>
  );
}
