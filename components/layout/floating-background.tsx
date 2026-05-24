"use client";

import { motion } from "framer-motion";

const blobs = [
  "left-[4%] top-24 h-48 w-48 bg-white/35 dark:bg-white/10",
  "right-[8%] top-36 h-64 w-64 bg-black/10 dark:bg-white/8",
  "left-[18%] bottom-24 h-56 w-56 bg-black/10 dark:bg-white/6",
  "right-[18%] bottom-16 h-40 w-40 bg-white/30 dark:bg-white/8"
];

export function FloatingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_30%)]" />
      {blobs.map((className, index) => (
        <motion.div
          key={className}
          className={`absolute rounded-full blur-3xl ${className}`}
          animate={{
            y: [0, -18, 10, 0],
            x: [0, 12, -10, 0],
            scale: [1, 1.08, 0.96, 1]
          }}
          transition={{
            duration: 12 + index * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
      ))}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/15" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle,rgba(15,23,42,0.9)_1px,transparent_1px)] [background-size:18px_18px] dark:opacity-[0.06]" />
    </div>
  );
}
