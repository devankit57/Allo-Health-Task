"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Building2,
  Orbit,
  ShieldCheck,
  Sparkles,
  TimerReset
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProductGrid } from "@/components/product/product-grid";
import { InventoryRadar } from "@/components/product/inventory-radar";
import {
  saveReservationSnapshot,
  type ReservationSnapshot
} from "@/components/reservation/reservation-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useProducts } from "@/hooks/useProducts";
import { useCreateReservation } from "@/hooks/useReservation";
import { useWarehouses } from "@/hooks/useWarehouses";
import { ApiError } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthSession();
  const productsQuery = useProducts();
  const warehousesQuery = useWarehouses();
  const createReservationMutation = useCreateReservation();
  const products = productsQuery.data ?? [];
  const warehouses = warehousesQuery.data ?? [];
  const totalInventoryLines = products.reduce((sum, product) => sum + product.inventory.length, 0);
  const totalAvailable = products.reduce(
    (sum, product) =>
      sum + product.inventory.reduce((innerSum, inventory) => innerSum + inventory.availableStock, 0),
    0
  );

  const handleReserve = async (input: {
    productId: string;
    warehouseId: string;
    quantity: number;
  }) => {
    if (!isAuthenticated) {
      toast.info("Login with Google before starting a protected reservation.");
      router.push(`/login?callbackUrl=${encodeURIComponent("/")}`);
      return;
    }

    try {
      const reservation = await createReservationMutation.mutateAsync(input);
      const selectedProduct = productsQuery.data?.find((product) => product.id === input.productId);
      const selectedInventory = selectedProduct?.inventory.find(
        (inventory) => inventory.warehouseId === input.warehouseId
      );

      const snapshot: ReservationSnapshot = {
        ...reservation,
        productName: selectedProduct?.name,
        productSku: selectedProduct?.sku,
        warehouseName: selectedInventory?.warehouseName ?? undefined
      };

      saveReservationSnapshot(snapshot);
      toast.success("Reservation created. Complete checkout before it expires.");
      router.push(`/reservation/${reservation.id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Out of stock or currently locked. Please try another warehouse.");
        return;
      }

      toast.error(error instanceof Error ? error.message : "Unable to create reservation.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-slate-900 dark:text-white" />
            Protected reservations with playful motion
          </div>
          <div className="space-y-5">
            <h1 className="font-display max-w-4xl text-balance text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl xl:text-7xl">
              Inventory and reservations
              <span className="block">Management System</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Browse live stock, reserve warehouse units with optimistic UI, and move through a
              premium countdown flow backed by Google-authenticated route protection.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Inventory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => productsQuery.refetch()}>
              Refresh Data
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/25 bg-white/60 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Products
              </p>
              <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{products.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/25 bg-white/60 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Inventory lines
              </p>
              <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{totalInventoryLines}</p>
            </div>
            <div className="rounded-[28px] border border-white/25 bg-white/60 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Ready units
              </p>
              <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{totalAvailable}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-4"
        >
          <Card className="overflow-hidden">
            <CardContent className="space-y-6 p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Live reservation orbit
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                    Warehouse pulse
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-black text-white shadow-[0_18px_40px_rgba(0,0,0,0.24)] dark:bg-white dark:text-black">
  <Orbit className="h-6 w-6" />
</div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {warehouses.slice(0, 4).map((warehouse, index) => (
                  <motion.div
                    key={warehouse.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="rounded-[24px] border border-white/20 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950 dark:text-white">{warehouse.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{warehouse.location}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/8 text-slate-900 dark:bg-white/10 dark:text-white">
                        <Building2 className="h-5 w-5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-[28px] bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold opacity-80">Fast path to reserve</p>
                    <p className="mt-2 text-xl font-black">
                      Reserve buttons route through Google auth before countdown checkout begins.
                    </p>
                  </div>
                  <Sparkles className="h-8 w-8 shrink-0" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div id="features" className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/25 bg-white/60 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
              <ShieldCheck className="h-5 w-5 text-slate-900 dark:text-white" />
              <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">Protected flow</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Reservation pages are guarded with middleware and persistent JWT sessions.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/25 bg-white/60 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
              <TimerReset className="h-5 w-5 text-slate-900 dark:text-white" />
              <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">Animated timer</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Countdown urgency and success states keep users aware without feeling stressful.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/25 bg-white/60 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
              <Boxes className="h-5 w-5 text-slate-900 dark:text-white" />
              <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">Optimistic stock</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Stock badges update instantly while React Query keeps inventory in sync.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="inventory" className="mt-12">
        <ProductGrid
          products={productsQuery.data}
          isLoading={productsQuery.isLoading}
          isError={productsQuery.isError}
          errorMessage={productsQuery.error instanceof Error ? productsQuery.error.message : undefined}
          isCreating={createReservationMutation.isPending}
          onRetry={() => {
            void productsQuery.refetch();
          }}
          onReserve={handleReserve}
        />
      </section>

      <InventoryRadar warehouses={warehouses} />

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden">
          <CardContent className="space-y-5 p-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/6 px-4 py-2 text-sm font-semibold text-slate-900 dark:bg-white/10 dark:text-white">
              <Sparkles className="h-4 w-4" />
              Why teams love it
            </div>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">
              Playful visuals, production-minded behavior.
            </h2>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              This frontend keeps the serious parts serious: route protection, reservation expiry,
              and typed API errors. The interface adds the fun with floating panels, blob gradients,
              and a soft cartoon shell that still feels premium.
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="grid gap-4 p-7 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/20 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/50">
              <p className="text-sm font-bold text-slate-950 dark:text-white">409 handling</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Out-of-stock conflicts surface instantly with clear feedback and no dead-end UI.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/20 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/50">
              <p className="text-sm font-bold text-slate-950 dark:text-white">410 handling</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Expired reservations gracefully transition into warning states on the detail page.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/20 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/50">
              <p className="text-sm font-bold text-slate-950 dark:text-white">JWT sessions</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                The avatar, login, logout, and protected routes all flow through Auth.js v5.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/20 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/50">
              <p className="text-sm font-bold text-slate-950 dark:text-white">Responsive motion</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Cards lift, blobs float, and transitions stay smooth across desktop and mobile.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
