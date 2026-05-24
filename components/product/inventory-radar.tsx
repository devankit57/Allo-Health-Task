"use client";

import { motion } from "framer-motion";
import { Building2, MapPin } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

import { Card, CardContent } from "@/components/ui/card";
import { type Warehouse } from "@/types/frontend";

function Circle({
  className,
  idx,
  ...rest
}: React.ComponentProps<typeof motion.div> & { idx: number }) {
  return (
    <motion.div
      {...rest}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: idx * 0.08, duration: 0.2 }}
      className={twMerge(
        "absolute left-1/2 top-1/2 rounded-full border border-black/10 -translate-x-1/2 -translate-y-1/2 dark:border-white/10",
        className
      )}
    />
  );
}

function Radar({ className }: { className?: string }) {
  const circles = new Array(5).fill(1);

  return (
    <div
      className={twMerge(
        "relative flex h-[18rem] w-[18rem] items-center justify-center rounded-full sm:h-[22rem] sm:w-[22rem]",
        className
      )}
    >
      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-radar-spin {
          animation: radar-spin 12s linear infinite;
        }
      `}</style>

      <div className="absolute inset-0 rounded-full border border-black/10 bg-[radial-gradient(circle,rgba(0,0,0,0.03),transparent_60%)] dark:border-white/10 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_60%)]" />

      <div
        style={{ transformOrigin: "50% 50%" }}
        className="animate-radar-spin absolute inset-0 z-10"
      >
        <div className="absolute left-1/2 top-1/2 h-[1px] w-1/2 -translate-y-1/2 bg-gradient-to-r from-black/70 to-transparent dark:from-white/70" />
      </div>

      {circles.map((_, idx) => (
        <Circle
          key={`circle-${idx}`}
          idx={idx}
          style={{
            height: `${(idx + 1) * 4.25}rem`,
            width: `${(idx + 1) * 4.25}rem`
          }}
        />
      ))}
    </div>
  );
}

function WarehouseNode({
  warehouse,
  delay,
  style
}: {
  warehouse: Warehouse;
  delay: number;
  style: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay }}
      className="absolute z-20"
      style={style}
    >
      <div className="w-24 rounded-[18px] border border-black/10 bg-white/92 p-2.5 text-center shadow-[0_14px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/88 sm:w-28">
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
          <Building2 className="h-3.5 w-3.5" />
        </div>
        <p className="mt-2 text-xs font-bold leading-4 text-slate-950 dark:text-white sm:text-sm">
          {warehouse.name}
        </p>
        <p className="mt-1 flex items-center justify-center gap-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400 sm:text-xs">
          <MapPin className="h-2.5 w-2.5" />
          {warehouse.location}
        </p>
      </div>
    </motion.div>
  );
}

function getWarehousePlacement(index: number) {
  const cardinalPlacements = [
    { x: 0, y: -30 },
    { x: 30, y: 0 },
    { x: 0, y: 30 },
    { x: -30, y: 0 }
  ];

  if (index < cardinalPlacements.length) {
    return cardinalPlacements[index];
  }

  const adjustedIndex = index - cardinalPlacements.length;
  const ringCapacities = [8, 12, 16, 20];
  const ringRadii = [16, 26, 35, 43];

  let remainingIndex = adjustedIndex;

  for (let ring = 0; ring < ringCapacities.length; ring += 1) {
    const capacity = ringCapacities[ring];

    if (remainingIndex < capacity) {
      const angle = (remainingIndex / capacity) * Math.PI * 2 - Math.PI / 2;

      return {
        x: Math.cos(angle) * ringRadii[ring],
        y: Math.sin(angle) * ringRadii[ring]
      };
    }

    remainingIndex -= capacity;
  }

  const overflowAngle = (remainingIndex / 24) * Math.PI * 2 - Math.PI / 2;
  const overflowRadius = 48;

  return {
    x: Math.cos(overflowAngle) * overflowRadius,
    y: Math.sin(overflowAngle) * overflowRadius
  };
}

export function InventoryRadar({ warehouses }: { warehouses: Warehouse[] }) {
  return (
    <section className="mt-12">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Warehouse Radar
            </p>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">
              Live view of your inventory hubs
            </h2>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              A quick visual map of the warehouses currently powering reservations across the system.
            </p>
          </div>

          <div className="relative flex min-h-[30rem] items-center justify-center overflow-hidden rounded-[30px] border border-black/8 bg-white/65 p-4 dark:border-white/10 dark:bg-slate-950/45 sm:min-h-[34rem]">
            <Radar className="sm:h-[24rem] sm:w-[24rem]" />
            {warehouses.map((warehouse, index) => {
              const { x, y } = getWarehousePlacement(index);

              return (
                <WarehouseNode
                  key={warehouse.id}
                  warehouse={warehouse}
                  delay={0.12 + index * 0.08}
                  style={{
                    left: `calc(50% + ${x}%)`,
                    top: `calc(50% + ${y}%)`,
                    transform: "translate(-50%, -50%)"
                  }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
