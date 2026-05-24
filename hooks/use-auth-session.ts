"use client";

import { useSession } from "next-auth/react";

export function useAuthSession() {
  const session = useSession();

  return {
    ...session,
    user: session.data?.user ?? null,
    isAuthenticated: session.status === "authenticated",
    isLoading: session.status === "loading"
  };
}
