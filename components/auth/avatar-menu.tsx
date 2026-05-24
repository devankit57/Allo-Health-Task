"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";

function getInitials(name?: string | null) {
  if (!name) {
    return "IR";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AvatarMenu() {
  const { user, isAuthenticated } = useAuthSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-white/70 px-5 text-sm font-semibold text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/65 dark:text-white"
      >
        <LogIn className="h-4 w-4" />
        Login
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-full border border-white/20 bg-white/70 py-1.5 pl-1.5 pr-4 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/70"
        aria-expanded={open}
        aria-label="Open user menu"
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "User avatar"}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/60 dark:ring-white/10"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-black to-zinc-500 text-sm font-bold text-white">
            {getInitials(user?.name)}
          </span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">
            {user?.name ?? "Operator"}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            Reservation pilot
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+12px)] w-48 overflow-hidden rounded-[24px] border border-black/10 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950"
          >
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
