import { EyeIcon } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface SelectiveCardProps<TData> {
    item: TData;
    columns: {
        accessorKey: string;
        header: string;
        cell?: ({ row }: { row: { original: TData } }) => React.ReactNode;
    }[];
    selectedItem: TData | null;
    onItemSelect?: (item: TData) => void;
    onEyeClick?: (item: TData) => React.ReactNode;
    showEyeIcon?: boolean;
    colors?: {
        background?: string;
        border?: string;
        hover?: string;
        selected?: string;
    };
    height?: string; // Added height prop
}

export function SelectiveCard<TData>({
    item,
    columns,
    selectedItem,
    onItemSelect,
    onEyeClick,
    showEyeIcon = true,
    colors = {
        background: "bg-card/50",
        border: "border-border/40",
        hover: "hover:bg-primary/5",
        selected: "ring-1 ring-primary bg-primary/5",
    },
    height = "min-h-[100px]", // Default height if not provided
}: SelectiveCardProps<TData>) {
    const [detailsContent, setDetailsContent] = useState<React.ReactNode | null>(null);

    const handleCardClick = (e: React.MouseEvent) => {
        // Only handle selection if not clicking the eye button
        if (!e.defaultPrevented && onItemSelect) {
            onItemSelect(item);
        }
    };

    const handleEyeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onEyeClick) {
            const content = onEyeClick(item);
            setDetailsContent(content);
        }
    };

    return (
        <div
            className={cn(
                "group relative cursor-pointer",
                selectedItem === item ? colors.selected : colors.background,
                "rounded-lg p-4",
                `border ${colors.border}`,
                colors.hover,
                "transition-all duration-200",
                "w-full max-w-md",
                "h-auto",
                height
            )}
            onClick={handleCardClick}
        >
            {onEyeClick && showEyeIcon && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "absolute top-1 right-2",
                            "text-muted-foreground hover:text-primary",
                            "hover:bg-primary/10 bg-transparent"
                        )}
                        onClick={handleEyeClick}
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Button>

                    {detailsContent}
                </>
            )}

            {/* Content Grid */}
            <div
                className={cn(
                    "grid gap-4 overflow-hidden",
                    // Only add top padding if eye icon is shown
                    onEyeClick && showEyeIcon ? "pt-5" : ""
                )}
            >
                {columns.map((column, colIndex) => (
                    <div key={colIndex} className="overflow-hidden">
                        {column.cell ? (
                            column.cell({ row: { original: item } })
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-muted-foreground mb-1 text-xs font-medium">{column.header}</span>
                                <span className="text-sm wrap-break-word">
                                    {}
                                    {(item as any)[column.accessorKey]}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Selection Indicator */}
            {selectedItem === item && <div className="bg-primary absolute inset-x-0 -bottom-px h-1 rounded-b-lg" />}
        </div>
    );
}
