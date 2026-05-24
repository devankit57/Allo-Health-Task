import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { handleApiError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/mongodb";
import { createReservation } from "@/lib/reservation";
import { createReservationSchema } from "@/schemas/reservation.schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email?.trim().toLowerCase();

    if (!userEmail) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const parsedBody = createReservationSchema.parse(body);
    const reservation = await createReservation({
      ...parsedBody,
      userEmail
    });

    return NextResponse.json(
      {
        reservation: {
          id: reservation._id.toString(),
          productId: reservation.productId.toString(),
          warehouseId: reservation.warehouseId.toString(),
          userEmail: reservation.userEmail,
          quantity: reservation.quantity,
          status: reservation.status,
          expiresAt: reservation.expiresAt,
          createdAt: reservation.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
