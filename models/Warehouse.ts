import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const warehouseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export type WarehouseDocument = InferSchemaType<typeof warehouseSchema>;

export const Warehouse: Model<WarehouseDocument> =
  models.Warehouse || model<WarehouseDocument>("Warehouse", warehouseSchema);
