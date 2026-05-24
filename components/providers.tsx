"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { type Session } from "next-auth";

export function Providers({
  children,
  session
}: {
  children: ReactNode;
  session: Session | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000
          }
        }
      })
  );

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          closeButton
          toastOptions={{
            className:
              "!rounded-[24px] !border !border-white/20 !bg-slate-950/85 !text-slate-50 !shadow-2xl backdrop-blur-xl dark:!border-white/10"
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
