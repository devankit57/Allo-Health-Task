import {
  productsResponseSchema,
  reservationResponseSchema,
  type CreateReservationPayload,
  type Product,
  type Reservation,
  type Warehouse,
  warehousesResponseSchema
} from "@/types/frontend";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(input: RequestInfo, init: RequestInit, parser: (data: unknown) => T) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? body.error
        : "Something went wrong.";

    throw new ApiError(message, response.status);
  }

  return parser(body);
}

export async function fetchProducts(): Promise<Product[]> {
  const parsed = await request("/api/products", { method: "GET" }, (data) =>
    productsResponseSchema.parse(data)
  );
  return parsed.products;
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const parsed = await request("/api/warehouses", { method: "GET" }, (data) =>
    warehousesResponseSchema.parse(data)
  );
  return parsed.warehouses;
}

export async function createReservation(payload: CreateReservationPayload): Promise<Reservation> {
  const parsed = await request(
    "/api/reservations",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    (data) => reservationResponseSchema.parse(data)
  );

  if (!parsed.reservation) {
    throw new ApiError("Reservation was not returned by the API.", 500);
  }

  return parsed.reservation;
}

export async function confirmReservation(id: string): Promise<Reservation | null> {
  const parsed = await request(
    `/api/reservations/${id}/confirm`,
    { method: "POST" },
    (data) => reservationResponseSchema.parse(data)
  );

  return parsed.reservation;
}

export async function releaseReservation(id: string): Promise<Reservation | null> {
  const parsed = await request(
    `/api/reservations/${id}/release`,
    { method: "POST" },
    (data) => reservationResponseSchema.parse(data)
  );

  return parsed.reservation;
}
