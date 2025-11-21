import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps<TData> {
    table: Table<TData>;
}

export function Pagination<TData>({ table }: PaginationProps<TData>) {
    const totalPages = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;

    const RenderPageButtons = () => {
        const buttons = [];
        const maxVisibleButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    className={`h-8 w-8 p-0 ${i === currentPage ? "bg-[#4F46E5] text-white hover:bg-[#4F46E5]/90" : "border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5]/10"}`}
                    onClick={() => table.setPageIndex(i - 1)}
                >
                    {i}
                </Button>
            );
        }
        return buttons;
    };

    return (
        <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                selected.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 border-[#4F46E5] p-0 text-[#4F46E5] hover:bg-[#4F46E5]/10 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <Tooltip>
                            <span>
                                <DoubleArrowLeftIcon className="h-4 w-4" />
                                <span className="sr-only">Go to first page</span>
                            </span>
                            <TooltipContent>Go to first page</TooltipContent>
                        </Tooltip>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 border-[#4F46E5] p-0 text-[#4F46E5] hover:bg-[#4F46E5]/10"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <Tooltip>
                            <span>
                                <ChevronLeftIcon className="h-4 w-4" />
                                <span className="sr-only">Go to previous page</span>
                            </span>
                            <TooltipContent>Go to previous page</TooltipContent>
                        </Tooltip>
                    </Button>
                    <RenderPageButtons />
                    <Button
                        variant="outline"
                        className="h-8 w-8 border-[#4F46E5] p-0 text-[#4F46E5] hover:bg-[#4F46E5]/10"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <Tooltip>
                            <span>
                                <ChevronRightIcon className="h-4 w-4" />
                                <span className="sr-only">Go to next page</span>
                            </span>
                            <TooltipContent>Go to next page</TooltipContent>
                        </Tooltip>
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 border-[#4F46E5] p-0 text-[#4F46E5] hover:bg-[#4F46E5]/10 lg:flex"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <Tooltip>
                            <span>
                                <DoubleArrowRightIcon className="h-4 w-4" />
                                <span className="sr-only">Go to last page</span>
                            </span>
                            <TooltipContent>Go to last page</TooltipContent>
                        </Tooltip>
                    </Button>
                </div>
            </div>
        </div>
    );
}
