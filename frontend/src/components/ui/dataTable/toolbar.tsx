"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Filter } from "./filter";

interface ToolbarProps<TData> {
    table: Table<TData>;
}

export function Toolbar<TData>({ table }: ToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {/* The filter cannot search the table data because it's currently set to only filter the "id" column. 
                To search across all columns, we need to implement a global filter. Here's how we can modify it: */}
                <Input
                    placeholder="Search all columns..."
                    value={(table.getState().globalFilter as string) ?? ""}
                    onChange={(event) => table.setGlobalFilter(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {isFiltered && (
                    <Button variant="destructive" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex items-center justify-between space-x-2">
                <Filter table={table} />
                {/* {Create Button} */}
            </div>
        </div>
    );
}
