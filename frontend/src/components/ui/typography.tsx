import { cva, VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

import type { JSX } from "react";

const typographyVariants = cva("", {
    variants: {
        element: {
            h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
            h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
            h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
            h4: "scroll-m-20 text-xl font-semibold tracking-tight",
            p: "leading-7 not-first:mt-6",
        },
        size: {
            large: "text-lg font-semibold",
            lead: "text-xl text-muted-foreground",
            small: "text-sm font-medium leading-none",
        },
        variant: {
            default: "",
            muted: "text-muted-foreground",
            subtle: "text-gray-600 dark:text-gray-400",
            accent: "text-primary",
            link: "text-blue-600 hover:underline dark:text-blue-400",
            blockquote: "mt-6 border-l-2 pl-6 italic",
        },
    },
    defaultVariants: {
        element: "p",
        size: "small",
        variant: "default",
    },
});

type TypographyProps = VariantProps<typeof typographyVariants> & {
    children: React.ReactNode;
    className?: string;
};

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ children, element = "p", size, variant, className, ...props }, ref) => {
        const Component = element as keyof JSX.IntrinsicElements;
        return React.createElement(
            Component,
            {
                className: cn(typographyVariants({ element, size, variant, className })),
                ref,
                ...props,
            },
            children
        );
    }
);

Typography.displayName = "Typography";

export { Typography, type TypographyProps };
