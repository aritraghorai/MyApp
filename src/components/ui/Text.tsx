import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const textVariants = cva("", {
    variants: {
        variant: {
            default: "text-foreground",
            muted: "text-muted-foreground",
            accent: "text-accent-foreground",
            primary: "text-primary",
            destructive: "text-destructive",
        },
        size: {
            xs: "text-xs",
            sm: "text-sm",
            base: "text-base",
            lg: "text-lg",
            xl: "text-xl",
            "2xl": "text-2xl",
            "3xl": "text-3xl",
        },
        weight: {
            normal: "font-normal",
            medium: "font-medium",
            semibold: "font-semibold",
            bold: "font-bold",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "base",
        weight: "normal",
    },
});

export interface TextProps
    extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "label";
    truncate?: boolean;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
    (
        {
            className,
            variant,
            size,
            weight,
            as: Component = "p",
            truncate = false,
            ...props
        },
        ref,
    ) => {
        return (
            <Component
                className={cn(
                    textVariants({ variant, size, weight }),
                    truncate && "truncate",
                    className,
                )}
                // @ts-expect-error - Polymorphic ref types are complex, this works at runtime
                ref={ref}
                {...props}
            />
        );
    },
);
Text.displayName = "Text";

export { Text, textVariants };
