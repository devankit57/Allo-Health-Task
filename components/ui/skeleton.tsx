import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-slate-200/70 dark:bg-slate-800/80",
        className
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10 animate-shimmer" />
    </div>
  );
}
