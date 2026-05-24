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
        "relative flex h-[20rem] w-[20rem] items-center justify-center rounded-full sm:h-[26rem] sm:w-[26rem]",
        className
      )}
    >
      <style>{`
        @keyframes radar-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-radar-spin {
          animation: radar-spin 12s linear infinite;
        }
      `}</style>

      {/* Radar Background */}
      <div className="absolute inset-0 rounded-full border border-black/10 bg-[radial-gradient(circle,rgba(0,0,0,0.03),transparent_60%)] dark:border-white/10 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_60%)]" />

      {/* Axis */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/10 dark:bg-white/10" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/10 dark:bg-white/10" />

      {/* Radar Sweep */}
      <div
        style={{ transformOrigin: "50% 50%" }}
        className="animate-radar-spin absolute inset-0 z-10"
      >
        <div className="absolute left-1/2 top-1/2 h-[1px] w-1/2 -translate-y-1/2 bg-gradient-to-r from-black/70 to-transparent dark:from-white/70" />
      </div>

      {/* Radar Rings */}
      {circles.map((_, idx) => (
        <Circle
          key={`circle-${idx}`}
          idx={idx}
          style={{
            height: `${(idx + 1) * 5}rem`,
            width: `${(idx + 1) * 5}rem`
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
      transition={{ duration: 0.3, delay }}
      className="absolute z-20"
      style={style}
    >
      <div className="w-28 rounded-[22px] border border-black/10 bg-white/92 p-3 text-center shadow-[0_18px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/88">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
          <Building2 className="h-4 w-4" />
        </div>

        <p className="mt-2 text-sm font-black text-slate-950 dark:text-white">
          {warehouse.name}
        </p>

        <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <MapPin className="h-3 w-3" />
          {warehouse.location}
        </p>
      </div>
    </motion.div>
  );
}

function getWarehousePlacement(warehouse: Warehouse) {
  const warehouseName = warehouse.name.toLowerCase();

  // Proper directional placement
  if (warehouseName.includes("north")) {
    return {
      x: 0,
      y: -160
    };
  }

  if (warehouseName.includes("east")) {
    return {
      x: 160,
      y: 0
    };
  }

  if (warehouseName.includes("south")) {
    return {
      x: 0,
      y: 160
    };
  }

  if (warehouseName.includes("west")) {
    return {
      x: -160,
      y: 0
    };
  }

  // fallback center
  return {
    x: 0,
    y: 0
  };
}

export function InventoryRadar({
  warehouses
}: {
  warehouses: Warehouse[];
}) {
  return (
    <section className="mt-12">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          {/* Left Content */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Warehouse Radar
            </p>

            <h2 className="text-3xl font-black text-slate-950 dark:text-white">
              Live view of your inventory hubs
            </h2>

            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              A quick visual map of the warehouses currently powering
              reservations across the system.
            </p>
          </div>

          {/* Radar */}
          <div className="relative flex min-h-[34rem] items-center justify-center overflow-hidden rounded-[32px] border border-black/8 bg-white/65 p-4 dark:border-white/10 dark:bg-slate-950/45 sm:min-h-[38rem]">
            <Radar />

            {warehouses.map((warehouse, index) => {
              const { x, y } = getWarehousePlacement(warehouse);

              return (
                <WarehouseNode
                  key={warehouse.id}
                  warehouse={warehouse}
                  delay={0.15 + index * 0.08}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
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