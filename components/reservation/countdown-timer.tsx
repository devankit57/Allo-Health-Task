"use client";

import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { formatTimeLeft } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: Date;
  onExpire?: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => expiresAt.getTime() - Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = expiresAt.getTime() - Date.now();
      setTimeLeft(next);

      if (next <= 0) {
        window.clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt, onExpire]);

  const isExpired = timeLeft <= 0;
  const urgent = timeLeft > 0 && timeLeft <= 60_000;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="flex flex-col gap-4 rounded-[28px] border border-white/20 bg-white/65 p-5 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/45 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="glass-chip rounded-[20px] p-3">
          <Clock3 className="h-5 w-5 text-slate-900 dark:text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Reservation expires in</p>
          <p className={`text-3xl font-black tabular-nums ${urgent ? "text-slate-700 dark:text-slate-200" : "text-slate-950 dark:text-white"}`}>
            {formatTimeLeft(timeLeft)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-slate-900 shadow-[0_0_18px_rgba(0,0,0,0.35)] dark:bg-white dark:shadow-[0_0_18px_rgba(255,255,255,0.2)]" />
        <Badge variant={isExpired ? "destructive" : urgent ? "warning" : "success"}>
          {isExpired ? "Expired" : urgent ? "Final minute" : "Active"}
        </Badge>
      </div>
    </motion.div>
  );
}
