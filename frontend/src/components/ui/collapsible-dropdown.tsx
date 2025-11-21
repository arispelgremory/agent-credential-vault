"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";

import { FormattedString } from "@/components/formatted-string";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ItemProps {
    value?: string;
    header?: string;
    count?: number;
    children: React.ReactNode;
}

interface CollapsibleDropdownProps {
    title: string;
    width?: string;
    children: React.ReactElement<ItemProps> | React.ReactElement<ItemProps>[];
    onSelect?: (value: any) => void;
    defaultValue?: string;
}

const Item = ({ value, header, count, children }: ItemProps) => {
    return <>{children}</>;
};

const CollapsibleDropdown = ({ title, width, children, onSelect, defaultValue }: CollapsibleDropdownProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(() => {
        if (defaultValue) return defaultValue;
        const firstChild = React.Children.toArray(children)[0] as React.ReactElement<ItemProps>;
        return firstChild?.props?.value || firstChild?.props?.header;
    });

    const style = width ? { width } : undefined;

    const handleChildClick = (child: React.ReactElement<ItemProps>) => {
        const displayText = child.props.value || child.props.header;
        setSelectedValue(displayText);
        setIsOpen(false);
        if (onSelect && child.props.value !== undefined) {
            onSelect(child.props.value);
        }
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative" style={style}>
            <Card style={style}>
                <CollapsibleTrigger asChild className="w-full">
                    <CardHeader className="hover:bg-accent/50 flex cursor-pointer flex-row items-center justify-between space-y-0 py-1">
                        <CardTitle className="flex w-full items-center justify-between pr-2 text-sm font-medium">
                            <div>
                                {title}
                                {!isOpen && selectedValue && (
                                    <span className="text-muted-foreground ml-2">
                                        : <FormattedString name={selectedValue} />
                                    </span>
                                )}
                            </div>
                            <Button variant="ghost" size="sm" className="w-9 p-0">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                <span className="sr-only">Toggle</span>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-background absolute right-0 left-0 z-50 rounded-b-lg border text-sm shadow-lg">
                    <ScrollArea className="h-auto">
                        <CardContent className="pt-2">
                            <div className="flex flex-col gap-2">
                                {React.Children.map(children, (child) => {
                                    const key = child.props.header || child.props.value || child.key;
                                    const isSelected = selectedValue === (child.props.header || child.props.children);
                                    return (
                                        <div
                                            key={key}
                                            className={`flex items-center gap-2 rounded p-1 ${
                                                isSelected ? "bg-accent" : "hover:bg-accent/50"
                                            }`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleChildClick(child);
                                            }}
                                        >
                                            {child}
                                            {child.props.count !== undefined && (
                                                <span className="min-w-6 shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-center text-xs text-white">
                                                    {child.props.count}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </ScrollArea>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};

CollapsibleDropdown.Item = Item;

export { CollapsibleDropdown };
export type { CollapsibleDropdownProps, ItemProps };
