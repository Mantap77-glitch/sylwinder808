import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary",
  secondary: "bg-slate-100 text-slate-700",
  destructive: "bg-red-100 text-red-700",
  outline: "border border-slate-200 bg-transparent text-slate-700",
};

export function Badge({
  className,
  children,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}