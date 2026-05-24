"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Boxes } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Product } from "@/types/frontend";

interface ProductGridProps {
  products: Product[] | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isCreating: boolean;
  onRetry: () => void;
  onReserve: (input: { productId: string; warehouseId: string; quantity: number }) => Promise<void>;
}

export function ProductGrid({
  products,
  isLoading,
  isError,
  errorMessage,
  isCreating,
  onRetry,
  onReserve
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (isError) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <AlertCircle className="h-10 w-10 text-slate-900 dark:text-white" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Unable to load inventory</h3>
            <p className="text-sm text-muted-foreground">{errorMessage ?? "Please try again."}</p>
          </div>
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <Boxes className="h-10 w-10 text-slate-900 dark:text-white" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No products yet</h3>
            <p className="text-sm text-muted-foreground">
              Seed inventory data first to populate the reservation dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">Inventory</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Browse products and reserve available stock.
          </p>
        </div>
        <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">
          {products.length} products available
        </p>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
            >
              <ProductCard product={product} onReserve={onReserve} isCreating={isCreating} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
