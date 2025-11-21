import { FC, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export const SheetComponent: FC<{
    trigger: ReactNode | string;
    children: ReactNode;
    title?: string;
    description?: string;
    isEdit: boolean;
    onClose?: () => void;
}> = ({ trigger, children, title, description, isEdit, onClose }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                {typeof trigger === "string" ? <Button variant="default">{trigger}</Button> : trigger}
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                {children}
                {isEdit && (
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit" onClick={() => onClose}>
                                Save changes
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
};
