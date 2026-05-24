import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardContent className="space-y-6 p-8">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-16 w-4/5" />
            <Skeleton className="h-6 w-3/5" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-8">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-14 w-full rounded-[24px]" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
