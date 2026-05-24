export const RESERVATION_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  RELEASED: "RELEASED",
  EXPIRED: "EXPIRED"
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export interface CreateReservationInput {
  productId: string;
  warehouseId: string;
  quantity: number;
}
