import * as React from "react";
import { cn } from "@/lib/utils";
export const SelectNative = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => <select ref={ref} className={cn("h-11 w-full rounded-xl border bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30", className)} {...props} />);
SelectNative.displayName = "SelectNative";
