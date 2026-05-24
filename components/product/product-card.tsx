"use client";

import { motion } from "framer-motion";
import { Loader2, MapPin, Package2, Warehouse } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InventoryBadge } from "@/components/product/inventory-badge";
import { type Product } from "@/types/frontend";

interface ProductCardProps {
  product: Product;
  onReserve: (input: { productId: string; warehouseId: string; quantity: number }) => Promise<void>;
  isCreating: boolean;
}

export function ProductCard({ product, onReserve, isCreating }: ProductCardProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const totalAvailable = product.inventory.reduce((sum, item) => sum + item.availableStock, 0);

  return (
    <motion.div
      layout
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <Card className="h-full overflow-hidden border-white/30 bg-white/65 dark:border-white/10 dark:bg-slate-950/55">
        <div className="border-b border-white/20 bg-black/5 p-6 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{product.sku}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_16px_32px_rgba(15,23,42,0.08)] dark:bg-slate-950/70">
              <Package2 className="h-6 w-6 text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-[20px] border border-white/20 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-slate-900/45">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Available stock
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{totalAvailable}</p>
            </div>
            <Badge variant={totalAvailable > 0 ? "success" : "destructive"}>
              {totalAvailable > 0 ? `${product.inventory.length} warehouses` : "Unavailable"}
            </Badge>
          </div>

          <div className="space-y-3">
            {product.inventory.map((inventory) => {
              const quantity = quantities[inventory.warehouseId] ?? 1;
              const outOfStock = inventory.availableStock <= 0;

              return (
                <div
                  key={inventory.inventoryId}
                  className="rounded-[26px] border border-white/20 bg-white/60 p-4 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-950/40"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{inventory.warehouseName ?? "Warehouse"}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <InventoryBadge availableStock={inventory.availableStock} />
                          <Badge variant="secondary">{inventory.totalUnits} total units</Badge>
                        </div>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_24px_rgba(15,23,42,0.08)] dark:bg-slate-900/75">
                        <Warehouse className="h-5 w-5 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        max={Math.max(1, inventory.availableStock)}
                        value={quantity}
                        aria-label={`Reservation quantity for ${product.name} in ${inventory.warehouseName ?? "warehouse"}`}
                        onChange={(event) =>
                          setQuantities((current) => ({
                            ...current,
                            [inventory.warehouseId]: Math.max(
                              1,
                              Math.min(
                                Math.floor(Number(event.target.value) || 1),
                                Math.max(1, inventory.availableStock)
                              )
                            )
                          }))
                        }
                        className="h-12 w-24 rounded-[18px] border-white/30 bg-white/80 text-center text-base font-bold dark:border-white/10 dark:bg-slate-900/70"
                      />
                      <Button
                        disabled={outOfStock || isCreating}
                        onClick={() =>
                          onReserve({
                            productId: product.id,
                            warehouseId: inventory.warehouseId,
                            quantity
                          })
                        }
                        className="h-12 flex-1 rounded-[18px]"
                      >
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {outOfStock ? "Unavailable" : "Reserve"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
