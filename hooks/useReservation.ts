"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirmReservation,
  createReservation,
  releaseReservation
} from "@/lib/api";
import { type Product } from "@/types/frontend";

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReservation,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });

      const previousProducts = queryClient.getQueryData<Product[]>(["products"]);

      queryClient.setQueryData<Product[]>(["products"], (current) =>
        current?.map((product) => {
          if (product.id !== variables.productId) {
            return product;
          }

          return {
            ...product,
            inventory: product.inventory.map((inventory) => {
              if (inventory.warehouseId !== variables.warehouseId) {
                return inventory;
              }

              return {
                ...inventory,
                reservedUnits: inventory.reservedUnits + variables.quantity,
                availableStock: Math.max(0, inventory.availableStock - variables.quantity)
              };
            })
          };
        })
      );

      return { previousProducts };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(["products"], context.previousProducts);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}

export function useConfirmReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}

export function useReleaseReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}
