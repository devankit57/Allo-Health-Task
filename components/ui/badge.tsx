import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "border-black/15 bg-black/5 text-black dark:border-white/15 dark:bg-white/10 dark:text-white",
        secondary: "border-slate-300/40 bg-white/60 text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
        accent: "border-black/20 bg-black/10 text-black dark:border-white/20 dark:bg-white/12 dark:text-white",
        success: "border-black/18 bg-black/7 text-black dark:border-white/18 dark:bg-white/10 dark:text-white",
        warning: "border-black/24 bg-black/12 text-black dark:border-white/24 dark:bg-white/14 dark:text-white",
        destructive: "border-black/30 bg-black/16 text-black dark:border-white/25 dark:bg-white/18 dark:text-white"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
