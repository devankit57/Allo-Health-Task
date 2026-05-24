"use client";

import { lazy, Suspense, useState } from "react";
import { useThemeMode } from "@/components/theme-provider";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);

export function LoginCardBackground() {
  const [isHovered, setIsHovered] = useState(false);
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const colorFront = isDark
    ? isHovered
      ? "#f2f2f2"
      : "#d4d4d4"
    : isHovered
      ? "#5f5f5f"
      : "#8f8f8f";

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-hidden="true"
    >
      <Suspense fallback={<div className="absolute inset-0 bg-black/5 dark:bg-white/5" />}>
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[30px] opacity-[0.08] mix-blend-multiply dark:opacity-[0.12] dark:mix-blend-screen">
          <Dithering
            colorBack="#00000000"
            colorFront={colorFront}
            shape="warp"
            type="4x4"
            speed={isHovered ? 0.6 : 0.2}
            className="size-full"
            minPixelRatio={1}
          />
        </div>
      </Suspense>
      <div className="absolute inset-0 rounded-[30px] bg-gradient-to-b from-white/96 via-zinc-50/88 to-white/98 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950/94" />
    </div>
  );
}
