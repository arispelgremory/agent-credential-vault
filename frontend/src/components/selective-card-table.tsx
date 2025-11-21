"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search, Filter, Plus, ChevronUp, ChevronDown } from "lucide-react";
import * as React from "react";

import { DecimalThousandSeparator } from "@/components/decimal-thousand-separator";
import { SelectiveCard } from "@/components/selective-card";
import { ThousandSeparator } from "@/components/thousand-separator";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable/handler";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { cn } from "@/lib/utils";

import { FormattedString } from "./formatted-string";

export type FilterConfig = {
    key: string;
    label: string;
    type: "select" | "date" | "text";
    options?: { label: string; value: string }[];
};

type StatusConfig = {
    key: string;
    getColor: (status: string) => string;
};

export type CustomColumnDef<TData, TValue> = {
    accessorKey: string;
    header: string;
    isMoney?: boolean;
    isFormattedString?: boolean;
    isStatus?: boolean;
    statusConfig?: StatusConfig;
    cell?: ({ row }: { row: { original: TData } }) => React.ReactNode;
} & Partial<ColumnDef<TData, TValue>>;

interface SelectiveCardTableProps<TData, TValue> {
    data: TData[];
    columns: {
        accessorKey: string;
        header: string;
        isMoney?: boolean;
        isFormattedString?: boolean;
        cell?: ({ row }: { row: { original: TData } }) => React.ReactNode;
    }[];
    className?: string;
    initialPageSize?: number;
    searchKey?: string;
    showPagination?: boolean;
    selectedItem?: TData | null;
    onItemSelect?: (item: TData) => void;
    tableColumns?: CustomColumnDef<TData, TValue>[];
    allData?: TValue[];
    cardColors?: {
        background?: string;
        border?: string;
        hover?: string;
        gradient?: string;
        selected?: string;
    };
    onEyeClick?: (item: TData) => React.ReactNode;
    gridFilters?: {
        config: FilterConfig[];
        values: Record<string, any>;
        onChange: (values: Record<string, any>) => void;
    };
    tableFilters?: {
        config: FilterConfig[];
        values: Record<string, any>;
        onChange: (values: Record<string, any>) => void;
    };
    tableActions?: {
        onAdd?: () => React.ReactNode;
        addButtonLabel?: string;
        addButtonDisabled?: boolean;
        popoverProps?: {
            side?: "top" | "right" | "bottom" | "left";
            align?: "start" | "center" | "end";
            className?: string;
        };
    };
    showEye?: boolean;
    tableIdProperty?: string;
    showViewAll?: boolean;
}

const isNumeric = (value: unknown): boolean => {
    return !isNaN(Number(value)) && value !== null && value !== "";
};

const isDate = (value: unknown): boolean => {
    return value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)));
};

const formatDate = (value: string | Date): string => {
    // Check if value matches ISO date string format
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
        return new Date(value).toLocaleDateString();
    }
    return value as string;
};

const FilterSection = ({
    config,
    values,
    onChange,
}: {
    config: FilterConfig[];
    values: Record<string, any>;
    onChange: (values: Record<string, any>) => void;
}) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="bg-primary hover:bg-primary/90 border-none text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[600px] sm:max-w-[600px]">
                <SheetHeader>
                    <SheetTitle>Filter Items</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 py-4">
                    {config.map((filter) => (
                        <div key={filter.key} className="space-y-2">
                            <Label htmlFor={`filter-${filter.key}`}>{filter.label}</Label>
                            {filter.type === "select" && (
                                <Select
                                    value={values[filter.key] || ""}
                                    onValueChange={(value) => onChange({ ...values, [filter.key]: value })}
                                >
                                    <SelectTrigger id={`filter-${filter.key}`}>
                                        <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{`${filter.label}`}</SelectItem>
                                        {filter.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {filter.type === "date" && (
                                <Input
                                    id={`filter-${filter.key}`}
                                    type="date"
                                    value={values[filter.key] || ""}
                                    onChange={(e) => onChange({ ...values, [filter.key]: e.target.value })}
                                    className="w-full"
                                />
                            )}
                            {filter.type === "text" && (
                                <Input
                                    id={`filter-${filter.key}`}
                                    type="text"
                                    value={values[filter.key] || ""}
                                    onChange={(e) => onChange({ ...values, [filter.key]: e.target.value })}
                                    className="w-full"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export function SelectiveCardTable<TData, TValue>({
    data,
    columns,
    className,
    initialPageSize = 8,
    searchKey,
    showPagination = true,
    selectedItem = null,
    onItemSelect,
    tableColumns,
    allData,
    cardColors,
    onEyeClick,
    gridFilters,
    tableFilters,
    tableActions,
    tableIdProperty = "id",
    showEye,
    showViewAll = true,
}: SelectiveCardTableProps<TData, TValue>) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(initialPageSize);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isViewAll, setIsViewAll] = React.useState(false);

    const filteredData = React.useMemo(() => {
        if (!searchQuery || !searchKey) return data;

        return data.filter((item: TData) => {
            const value = (item as any)[searchKey];
            return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [data, searchQuery, searchKey]);

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const currentData = filteredData.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(Math.min(Math.max(1, newPage), totalPages));
    };

    const handlePageSizeChange = (newSize: string) => {
        const size = parseInt(newSize);
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleViewAllToggle = () => {
        setIsViewAll(!isViewAll);
        setPageSize(isViewAll ? initialPageSize : 16);
        setCurrentPage(1);

        if (isViewAll && selectedItem) {
            const selectedItemIndex = filteredData.findIndex(
                (item: TData) => (item as any)[tableIdProperty] === (selectedItem as any)[tableIdProperty]
            );
            if (selectedItemIndex !== -1) {
                const newPage = Math.floor(selectedItemIndex / initialPageSize) + 1;
                setCurrentPage(newPage);
            }
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="max-w-sm flex-1">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {showViewAll && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewAllToggle}
                            className="flex items-center gap-2 border-red-500 text-red-500 transition-colors duration-200 hover:border-red-600 hover:bg-red-100 hover:text-red-600"
                        >
                            {isViewAll ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    View Less
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    View All
                                </>
                            )}
                        </Button>
                    )}
                    {gridFilters && (
                        <FilterSection
                            config={gridFilters.config}
                            values={gridFilters.values}
                            onChange={gridFilters.onChange}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {currentData.map((item, index) => (
                    <SelectiveCard
                        key={index}
                        item={item}
                        columns={columns}
                        selectedItem={selectedItem}
                        onItemSelect={onItemSelect}
                        onEyeClick={onEyeClick}
                        colors={cardColors}
                        showEyeIcon={showEye}
                    />
                ))}
            </div>

            {/* Pagination */}
            {showPagination && totalPages > 0 && (
                <div className="flex items-center justify-between rounded-lg p-4 shadow-md">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <p className="text-sm font-medium">Items per page</p>
                            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                <SelectTrigger className="focus:ring-primary h-8 w-[70px] focus:ring-2">
                                    <SelectValue placeholder={pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[4, 8, 12, 16, 20].map((size) => (
                                        <SelectItem key={size} value={size.toString()}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="bg-primary/10 flex w-[120px] items-center justify-center rounded-full px-3 py-1 text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-primary/10 h-8 w-8 p-0 transition-colors"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-primary/10 h-8 w-8 p-0 transition-colors"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Updated DataTable for Selected Item Products or All Data */}
            {tableColumns && (
                <div className="bg-card/50 mt-8 rounded-xl py-6 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        {tableFilters && (
                            <FilterSection
                                config={tableFilters.config}
                                values={tableFilters.values}
                                onChange={tableFilters.onChange}
                            />
                        )}
                        {tableActions?.onAdd && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        className="bg-primary hover:bg-primary/90 text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        size="sm"
                                        disabled={!selectedItem}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {tableActions.addButtonLabel || "Add New"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className={cn("w-auto", tableActions.popoverProps?.className)}
                                    side={tableActions.popoverProps?.side}
                                    align={tableActions.popoverProps?.align}
                                >
                                    {tableActions.onAdd()}
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-lg">
                        <DataTable
                            enableToolbar={false}
                            columns={
                                tableColumns.map((column) => ({
                                    ...column,
                                    cell:
                                        column.cell ||
                                        (({ getValue }) => {
                                            const value = getValue();

                                            if (column.isStatus && column.statusConfig) {
                                                const color = column.statusConfig.getColor(value as string);
                                                return (
                                                    <span
                                                        className={`${color} inline-block min-w-[100px] rounded-full px-2 py-1 text-center text-xs font-semibold whitespace-nowrap`}
                                                    >
                                                        <FormattedString name={value as string} />
                                                    </span>
                                                );
                                            }

                                            if (column.isMoney) {
                                                return <DecimalThousandSeparator value={Number(value)} />;
                                            }

                                            if (isNumeric(value)) {
                                                return <ThousandSeparator value={Number(value)} />;
                                            }

                                            if (isDate(value)) {
                                                return formatDate(value as string);
                                            }

                                            if (column.isFormattedString) {
                                                return <FormattedString name={value as string} />;
                                            }

                                            return value;
                                        }),
                                })) as ColumnDef<TValue, any>[]
                            }
                            data={
                                allData?.filter((item: TValue) =>
                                    selectedItem
                                        ? (item as any)[tableIdProperty] === (selectedItem as any)[tableIdProperty]
                                        : true
                                ) || []
                            }
                            enableRowSelection={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
