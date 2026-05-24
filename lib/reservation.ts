import mongoose, { ClientSession } from "mongoose";

import { acquireLock, releaseLock } from "@/lib/redis";
import {
  ConflictAppError,
  GoneAppError,
  NotFoundAppError
} from "@/lib/errors";
import { Inventory } from "@/models/Inventory";
import { Reservation } from "@/models/Reservation";
import { RESERVATION_STATUS, type CreateReservationInput } from "@/types/reservation";
import { ensureObjectId } from "@/utils/object-id";
import type { ReservationDocument } from "@/models/Reservation";

const RESERVATION_TTL_MINUTES = 10;

function getInventoryLockKey(productId: string, warehouseId: string) {
  return `lock:inventory:${productId}:${warehouseId}`;
}

function getExpiryDate() {
  return new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);
}

async function loadReservationOrThrow(id: string, session: ClientSession) {
  const reservation = await Reservation.findById(id).session(session);

  if (!reservation) {
    throw new NotFoundAppError("Reservation not found.");
  }

  return reservation;
}

async function cleanupReservationResources(lock: { key: string; token: string }, session: ClientSession) {
  await session.endSession();

  try {
    await releaseLock(lock.key, lock.token);
  } catch (error) {
    console.error("Failed to release Redis lock:", error);
  }
}

export async function createReservation(
  input: CreateReservationInput & { userEmail: string }
): Promise<ReservationDocument> {
  ensureObjectId(input.productId, "productId");
  ensureObjectId(input.warehouseId, "warehouseId");

  const lock = await acquireLock(getInventoryLockKey(input.productId, input.warehouseId));
  const session = await mongoose.startSession();

  try {
    let createdReservation: ReservationDocument | null = null;

    await session.withTransaction(async () => {
      const inventory = await Inventory.findOne({
        productId: input.productId,
        warehouseId: input.warehouseId
      }).session(session);

      if (!inventory) {
        throw new NotFoundAppError("Inventory record not found.");
      }

      const updatedInventory = await Inventory.findOneAndUpdate(
        {
          productId: input.productId,
          warehouseId: input.warehouseId,
          $expr: {
            $gte: [{ $subtract: ["$totalUnits", "$reservedUnits"] }, input.quantity]
          }
        },
        {
          $inc: {
            reservedUnits: input.quantity
          }
        },
        {
          new: true,
          session
        }
      );

      if (!updatedInventory) {
        throw new ConflictAppError("Insufficient stock for the requested reservation.");
      }

      const [reservation] = await Reservation.create(
        [
          {
            productId: input.productId,
            warehouseId: input.warehouseId,
            userEmail: input.userEmail,
            quantity: input.quantity,
            status: RESERVATION_STATUS.PENDING,
            expiresAt: getExpiryDate()
          }
        ],
        { session }
      );

      createdReservation = reservation;
    });

    if (!createdReservation) {
      throw new Error("Reservation creation failed unexpectedly.");
    }

    return createdReservation;
  } finally {
    await cleanupReservationResources(lock, session);
  }
}

export async function confirmReservation(id: string): Promise<ReservationDocument | null> {
  ensureObjectId(id, "id");

  const reservationSnapshot = await Reservation.findById(id).lean();

  if (!reservationSnapshot) {
    throw new NotFoundAppError("Reservation not found.");
  }

  const lock = await acquireLock(
    getInventoryLockKey(
      reservationSnapshot.productId.toString(),
      reservationSnapshot.warehouseId.toString()
    )
  );
  const session = await mongoose.startSession();

  try {
    let confirmedReservation: ReservationDocument | null = null;
    let expired = false;

    await session.withTransaction(async () => {
      const reservation = await loadReservationOrThrow(id, session);

      if (reservation.status !== RESERVATION_STATUS.PENDING) {
        throw new ConflictAppError("Only pending reservations can be confirmed.");
      }

      if (reservation.expiresAt.getTime() <= Date.now()) {
        const expiredInventory = await Inventory.findOneAndUpdate(
          {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
            reservedUnits: { $gte: reservation.quantity }
          },
          {
            $inc: {
              reservedUnits: -reservation.quantity
            }
          },
          {
            new: true,
            session
          }
        );

        if (!expiredInventory) {
          throw new ConflictAppError("Reserved inventory could not be released.");
        }

        reservation.status = RESERVATION_STATUS.EXPIRED;
        await reservation.save({ session });
        expired = true;
        return;
      }

      const updatedInventory = await Inventory.findOneAndUpdate(
        {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
          totalUnits: { $gte: reservation.quantity },
          reservedUnits: { $gte: reservation.quantity }
        },
        {
          $inc: {
            totalUnits: -reservation.quantity,
            reservedUnits: -reservation.quantity
          }
        },
        {
          new: true,
          session
        }
      );

      if (!updatedInventory) {
        throw new ConflictAppError("Inventory could not be confirmed for this reservation.");
      }

      reservation.status = RESERVATION_STATUS.CONFIRMED;
      await reservation.save({ session });
      confirmedReservation = reservation;
    });

    if (expired) {
      throw new GoneAppError("Reservation has expired.");
    }

    return confirmedReservation;
  } finally {
    await cleanupReservationResources(lock, session);
  }
}

export async function releaseReservation(id: string): Promise<ReservationDocument | null> {
  ensureObjectId(id, "id");

  const reservationSnapshot = await Reservation.findById(id).lean();

  if (!reservationSnapshot) {
    throw new NotFoundAppError("Reservation not found.");
  }

  const lock = await acquireLock(
    getInventoryLockKey(
      reservationSnapshot.productId.toString(),
      reservationSnapshot.warehouseId.toString()
    )
  );
  const session = await mongoose.startSession();

  try {
    let releasedReservation: ReservationDocument | null = null;

    await session.withTransaction(async () => {
      const reservation = await loadReservationOrThrow(id, session);

      if (reservation.status !== RESERVATION_STATUS.PENDING) {
        throw new ConflictAppError("Only pending reservations can be released.");
      }

      const updatedInventory = await Inventory.findOneAndUpdate(
        {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
          reservedUnits: { $gte: reservation.quantity }
        },
        {
          $inc: {
            reservedUnits: -reservation.quantity
          }
        },
        {
          new: true,
          session
        }
      );

      if (!updatedInventory) {
        throw new ConflictAppError("Reserved inventory could not be released.");
      }

      reservation.status = RESERVATION_STATUS.RELEASED;
      await reservation.save({ session });
      releasedReservation = reservation;
    });

    return releasedReservation;
  } finally {
    await cleanupReservationResources(lock, session);
  }
}

export async function expireReservation(id: string) {
  ensureObjectId(id, "id");

  const reservationSnapshot = await Reservation.findById(id).lean();

  if (!reservationSnapshot) {
    throw new NotFoundAppError("Reservation not found.");
  }

  const lock = await acquireLock(
    getInventoryLockKey(
      reservationSnapshot.productId.toString(),
      reservationSnapshot.warehouseId.toString()
    ),
    {
      retryCount: 1,
      retryDelayMs: 100
    }
  );
  const session = await mongoose.startSession();

  try {
    let changed = false;

    await session.withTransaction(async () => {
      const reservation = await loadReservationOrThrow(id, session);

      if (
        reservation.status !== RESERVATION_STATUS.PENDING ||
        reservation.expiresAt.getTime() > Date.now()
      ) {
        return;
      }

      const updatedInventory = await Inventory.findOneAndUpdate(
        {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
          reservedUnits: { $gte: reservation.quantity }
        },
        {
          $inc: {
            reservedUnits: -reservation.quantity
          }
        },
        {
          new: true,
          session
        }
      );

      if (!updatedInventory) {
        throw new ConflictAppError("Reserved inventory could not be released.");
      }

      reservation.status = RESERVATION_STATUS.EXPIRED;
      await reservation.save({ session });
      changed = true;
    });

    return changed;
  } finally {
    await cleanupReservationResources(lock, session);
  }
}
