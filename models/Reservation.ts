import {
  InferSchemaType,
  Model,
  Schema,
  Types,
  model,
  models
} from "mongoose";

import { RESERVATION_STATUS } from "@/types/reservation";

const reservationSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.PENDING,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true
    }
  }
);

reservationSchema.index({ status: 1, expiresAt: 1 });
reservationSchema.index({ userEmail: 1, createdAt: -1 });

export interface ReservationDocument
  extends InferSchemaType<typeof reservationSchema> {
  _id: Types.ObjectId;
}

export const Reservation: Model<ReservationDocument> =
  models.Reservation ||
  model<ReservationDocument>("Reservation", reservationSchema);
