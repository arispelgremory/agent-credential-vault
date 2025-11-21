import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export const SearchSection = ({
    searchQuery,
    onSearchChange,
    isViewAll,
    onViewAllToggle,
    searchCategory,
}: {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    isViewAll: boolean;
    onViewAllToggle: () => void;
    searchCategory: string;
}) => (
    <div className="flex items-center justify-between gap-4">
        <div className="max-w-sm flex-1">
            <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                    placeholder={`Search ${searchCategory}...`}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8"
                />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onViewAllToggle}
                className="border-primary text-primary hover:bg-primary/10 flex h-10 items-center gap-2"
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
        </div>
    </div>
);
