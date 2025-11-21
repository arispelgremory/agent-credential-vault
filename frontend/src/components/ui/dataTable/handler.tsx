import {
    ColumnDef,
    VisibilityState,
    ColumnFiltersState,
    SortingState,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Pagination } from "@/components/ui/dataTable/pagination";
import { Toolbar } from "@/components/ui/dataTable/toolbar";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    enableRowSelection?: boolean;
    enableToolbar?: boolean;
    onRowSelectionChange?: (updater: Record<string, boolean>) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    enableRowSelection = false,
    enableToolbar = true,
    onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection,
        onRowSelectionChange: (value) => {
            const newSelection = typeof value === "function" ? value(rowSelection) : value;
            setRowSelection(newSelection);
            onRowSelectionChange?.(newSelection);
        },
        getRowId: (row: any) => row.id?.toString(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-4 px-1">
            {enableToolbar && <Toolbar table={table} />}
            <div className="rounded-md border border-[#8F86FF] bg-linear-to-r from-[#8F86FF] to-[#A3A5FF]">
                <Table>
                    <TableHeader className="bg-linear-to-r from-[#4F46E5] to-[#6366F1]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {enableRowSelection && (
                                    <TableHead className="w-[50px] text-white">
                                        <div className="flex h-full items-center justify-center">
                                            <Checkbox
                                                checked={table.getIsAllPageRowsSelected()}
                                                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                                aria-label="Select all"
                                                className="border-2 border-white text-white"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-white">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} h-12`}
                                >
                                    {enableRowSelection && (
                                        <TableCell className="w-[50px] align-middle">
                                            <div className="flex h-full items-center justify-center">
                                                <Checkbox
                                                    checked={row.getIsSelected()}
                                                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                                                    aria-label="Select row"
                                                />
                                            </div>
                                        </TableCell>
                                    )}
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-2">
                <Pagination table={table} />
            </div>
        </div>
    );
}
