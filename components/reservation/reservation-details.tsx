"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  PartyPopper,
  PackageCheck,
  Rocket,
  Warehouse
} from "lucide-react";

import { CountdownTimer } from "@/components/reservation/countdown-timer";
import { type ReservationSnapshot } from "@/components/reservation/reservation-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatStatusLabel } from "@/lib/utils";

interface ReservationDetailsProps {
  reservation: ReservationSnapshot | null;
  isConfirming: boolean;
  isReleasing: boolean;
  onConfirm: () => void;
  onRelease: () => void;
  onExpire: () => void;
}

export function ReservationDetails({
  reservation,
  isConfirming,
  isReleasing,
  onConfirm,
  onRelease,
  onExpire
}: ReservationDetailsProps) {
  if (!reservation) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <AlertTriangle className="h-10 w-10 text-slate-900 dark:text-white" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Reservation snapshot unavailable</h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              This frontend currently relies on the reservation data returned by the create API.
              Open a reservation by creating it from the dashboard first.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const expired = reservation.status === "EXPIRED" || reservation.expiresAt.getTime() <= Date.now();
  const terminal = reservation.status === "CONFIRMED" || reservation.status === "RELEASED" || expired;
  const badgeVariant =
    reservation.status === "CONFIRMED"
      ? "success"
      : reservation.status === "RELEASED"
        ? "secondary"
        : expired
          ? "destructive"
          : "default";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="border-b border-white/20 bg-gradient-to-br from-black/8 via-zinc-500/8 to-white/20 p-6 dark:border-white/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  Reservation Overview
                </p>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                  {reservation.productName ?? "Reserved product"}
                </h1>
                <p className="text-sm text-muted-foreground">Reservation ID: {reservation.id}</p>
              </div>
              <Badge variant={badgeVariant}>{formatStatusLabel(expired ? "EXPIRED" : reservation.status)}</Badge>
            </div>
          </div>

          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[28px] border border-white/20 bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold opacity-80">Animated checkout window</p>
                    <p className="mt-2 text-2xl font-black">
                      Confirm before the timer lands at zero.
                    </p>
                  </div>
                  <Rocket className="h-8 w-8 shrink-0" />
                </div>
              </div>
              <div className="rounded-[28px] border border-white/20 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-900/50">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Quantity held
                </p>
                <p className="mt-3 text-4xl font-black text-slate-950 dark:text-white">
                  {reservation.quantity}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Units temporarily locked</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <CountdownTimer expiresAt={reservation.expiresAt} onExpire={onExpire} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/20 bg-white/70 p-5 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/40">
                <div className="mb-3 flex items-center gap-3">
                  <div className="glass-chip rounded-[20px] p-3">
                    <PackageCheck className="h-5 w-5 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Product</p>
                    <p className="text-lg font-black text-slate-950 dark:text-white">
                      {reservation.productName ?? reservation.productId}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">SKU: {reservation.productSku ?? "Unavailable"}</p>
              </div>

              <div className="rounded-[28px] border border-white/20 bg-white/70 p-5 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/40">
                <div className="mb-3 flex items-center gap-3">
                  <div className="glass-chip rounded-[20px] p-3">
                    <Warehouse className="h-5 w-5 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Warehouse</p>
                    <p className="text-lg font-black text-slate-950 dark:text-white">
                      {reservation.warehouseName ?? reservation.warehouseId}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Quantity reserved: {reservation.quantity}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={onConfirm}
                disabled={terminal || isConfirming || isReleasing}
                className="flex-1 rounded-[20px]"
              >
                Confirm Purchase
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={onRelease}
                disabled={terminal || isConfirming || isReleasing}
                className="flex-1 rounded-[20px]"
              >
                Cancel Reservation
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="h-full">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="glass-chip rounded-[20px] p-3">
                {reservation.status === "CONFIRMED" ? (
                  <PartyPopper className="h-5 w-5 text-slate-900 dark:text-white" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">Next steps</h2>
                <p className="text-sm text-muted-foreground">
                  Complete checkout before the timer runs out to secure stock.
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-[28px] border border-white/20 bg-white/70 p-5 text-sm leading-7 text-muted-foreground dark:border-white/10 dark:bg-slate-900/45">
              <p>The reservation is held for 10 minutes from creation.</p>
              <p>Confirming finalizes the purchase and deducts inventory permanently.</p>
              <p>Cancelling releases reserved units back to available stock immediately.</p>
              <p>Expired reservations automatically disable action buttons and should be released by the cron job.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
