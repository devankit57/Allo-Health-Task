"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("theme-mode");
    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialMode = stored === "dark" || stored === "light" ? stored : preferredDark ? "dark" : "light";

    setMode(initialMode);
    document.documentElement.classList.toggle("dark", initialMode === "dark");
  }, []);

  const toggleMode = () => {
    setMode((current) => {
      const next = current === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      window.localStorage.setItem("theme-mode", next);
      return next;
    });
  };

  return <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider.");
  }

  return context;
}
