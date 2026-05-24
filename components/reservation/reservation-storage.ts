import { type Reservation } from "@/types/frontend";

const STORAGE_KEY = "inventory-reservations";

export interface ReservationSnapshot extends Reservation {
  productName?: string;
  productSku?: string;
  warehouseName?: string;
}

export function saveReservationSnapshot(reservation: ReservationSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  const current = loadAllReservationSnapshots();
  current[reservation.id] = reservation;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function getReservationSnapshot(id: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const snapshot = loadAllReservationSnapshots()[id];
  return snapshot ? normalizeReservationSnapshot(snapshot) : null;
}

function loadAllReservationSnapshots(): Record<string, ReservationSnapshot> {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, ReservationSnapshot>;
  } catch {
    return {};
  }
}

function normalizeReservationSnapshot(snapshot: ReservationSnapshot) {
  return {
    ...snapshot,
    expiresAt: new Date(snapshot.expiresAt),
    createdAt: new Date(snapshot.createdAt)
  };
}
