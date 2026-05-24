import { NextResponse } from "next/server";

import { ConflictAppError, handleApiError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/mongodb";
import { expireReservation } from "@/lib/reservation";
import { Reservation } from "@/models/Reservation";
import { RESERVATION_STATUS } from "@/types/reservation";

export async function POST() {
  try {
    await connectToDatabase();

    const expiredReservations = await Reservation.find({
      status: RESERVATION_STATUS.PENDING,
      expiresAt: { $lte: new Date() }
    })
      .select("_id")
      .lean();

    let expiredCount = 0;
    let skippedCount = 0;

    for (const reservation of expiredReservations) {
      try {
        const changed = await expireReservation(reservation._id.toString());

        if (changed) {
          expiredCount += 1;
        }
      } catch (error) {
        if (error instanceof ConflictAppError) {
          skippedCount += 1;
          continue;
        }

        throw error;
      }
    }

    return NextResponse.json({
      processed: expiredReservations.length,
      expiredCount,
      skippedCount
    });
  } catch (error) {
    return handleApiError(error);
  }
}
