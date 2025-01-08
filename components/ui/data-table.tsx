"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  totalRecords: number;
  setTotalRecords: React.Dispatch<React.SetStateAction<number>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  isLoading?: boolean;
  refreshTable: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  setPagination,
  totalRecords,
  setTotalRecords,
  globalFilter,
  setGlobalFilter,
  isLoading = true,
  refreshTable,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      pagination,
      globalFilter,
    },
    pageCount:
      totalRecords > 0 ? Math.ceil(totalRecords / pagination.pageSize) : 1,
  });

  const [debouncedFilter, setDebouncedFilter] = useState(globalFilter);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalFilter(debouncedFilter);
    }, 300);

    return () => clearTimeout(timeout);
  }, [debouncedFilter, setGlobalFilter]);

  return (
    <div>
      <div className="flex items-center py-4 justify-end gap-2">
        <Input
          placeholder="Search..."
          value={debouncedFilter}
          onChange={(event) => setDebouncedFilter(event.target.value)}
          className="max-w-sm"
        />
        <Button variant={"ghost"} onClick={refreshTable}>
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className="border-b-0">
                <TableCell colSpan={columns.length}>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="h-5 w-5 rounded-full border-t-2 border-b-2 border-gray-200"></div>
                      <div className="absolute top-0 left-0 h-5 w-5 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {table.getRowModel().rows?.length
              ? table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
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
