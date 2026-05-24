import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/mongodb";
import { releaseReservation } from "@/lib/reservation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const reservation = await releaseReservation(id);

    return NextResponse.json({
      reservation: reservation
        ? {
            id: reservation._id.toString(),
            productId: reservation.productId.toString(),
            warehouseId: reservation.warehouseId.toString(),
            quantity: reservation.quantity,
            status: reservation.status,
            expiresAt: reservation.expiresAt,
            createdAt: reservation.createdAt
          }
        : null
    });
  } catch (error) {
    return handleApiError(error);
  }
}
