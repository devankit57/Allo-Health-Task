import { z } from "zod";

export const inventoryItemSchema = z.object({
  inventoryId: z.string(),
  warehouseId: z.string(),
  warehouseName: z.string().nullable(),
  totalUnits: z.number(),
  reservedUnits: z.number(),
  availableStock: z.number()
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  inventory: z.array(inventoryItemSchema)
});

export const productsResponseSchema = z.object({
  products: z.array(productSchema)
});

export const warehouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string()
});

export const warehousesResponseSchema = z.object({
  warehouses: z.array(warehouseSchema)
});

export const reservationSchema = z.object({
  id: z.string(),
  productId: z.string(),
  warehouseId: z.string(),
  userEmail: z.string().email().optional(),
  quantity: z.number(),
  status: z.enum(["PENDING", "CONFIRMED", "RELEASED", "EXPIRED"]),
  expiresAt: z.string().or(z.date()).transform((value) => new Date(value)),
  createdAt: z.string().or(z.date()).transform((value) => new Date(value))
});

export const reservationResponseSchema = z.object({
  reservation: reservationSchema.nullable()
});

export type Product = z.infer<typeof productSchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type Warehouse = z.infer<typeof warehouseSchema>;
export type Reservation = z.infer<typeof reservationSchema>;

export interface UserReservationView {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  userEmail: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "RELEASED" | "EXPIRED";
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateReservationPayload {
  productId: string;
  warehouseId: string;
  quantity: number;
}
