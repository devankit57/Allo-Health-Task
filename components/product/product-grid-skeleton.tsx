import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="h-24 w-full bg-gradient-to-r from-zinc-200/80 via-white to-zinc-100/80 dark:from-zinc-900 dark:via-zinc-800 dark:to-black" />
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((__, innerIndex) => (
                <div
                  key={innerIndex}
                  className="rounded-[1.25rem] border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-slate-950/40"
                >
                  <Skeleton className="h-4 w-1/2" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Skeleton className="h-11 w-24" />
                    <Skeleton className="h-11 flex-1 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
