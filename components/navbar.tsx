"use client";

import { motion } from "framer-motion";
import { Moon, Package2, SunMedium } from "lucide-react";
import Link from "next/link";

import { AvatarMenu } from "@/components/auth/avatar-menu";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useThemeMode } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { mode, toggleMode } = useThemeMode();
  const { isAuthenticated } = useAuthSession();

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 px-3 pt-3 sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/25 bg-white/70 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[22px] border border-white/20 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-white">
            <img
              src="https://media.allohealth.care/allo-logo-v1.png"
              alt="Allo Health logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Allo Health
            </p>
            <p className="truncate text-lg font-black text-slate-950 dark:text-white">
              Inventory Task
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <Link
            href="/#inventory"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
          >
            Inventory
          </Link>
          <Link
            href="/#features"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
          >
            Features
          </Link>
          {isAuthenticated ? (
            <Link
              href="/user-reserved"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              My Reservations
            </Link>
          ) : null}
          <div className="flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
            <Package2 className="h-3.5 w-3.5" />
            Live stock locks
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleMode}
            className="h-11 w-11 rounded-full"
          >
            {mode === "dark" ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <AvatarMenu />
        </div>
      </div>
    </motion.header>
  );
}
