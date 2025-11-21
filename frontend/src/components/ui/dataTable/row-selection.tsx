"use client";

import {
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Table } from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    });

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                <th>
                                    <Checkbox
                                        checked={table.getIsAllPageRowsSelected()}
                                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                        aria-label="Select all"
                                        className="text-white"
                                    />
                                </th>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>{header.column.columnDef.header as React.ReactNode}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                <td>
                                    <Checkbox
                                        checked={row.getIsSelected()}
                                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                                        aria-label="Select row"
                                    />
                                </td>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>{cell.getValue() as React.ReactNode}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                selected.
            </div>
        </div>
    );
}
