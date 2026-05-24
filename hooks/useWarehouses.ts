"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchWarehouses } from "@/lib/api";

export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: fetchWarehouses
  });
}
