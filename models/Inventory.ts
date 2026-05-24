import {
  InferSchemaType,
  Model,
  Schema,
  Types,
  model,
  models
} from "mongoose";

const inventorySchema = new Schema(
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
    totalUnits: {
      type: Number,
      required: true,
      min: 0
    },
    reservedUnits: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

inventorySchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

inventorySchema.virtual("availableStock").get(function (this: {
  totalUnits: number;
  reservedUnits: number;
}) {
  return this.totalUnits - this.reservedUnits;
});

export interface InventoryDocument
  extends InferSchemaType<typeof inventorySchema> {
  _id: Types.ObjectId;
}

export const Inventory: Model<InventoryDocument> =
  models.Inventory || model<InventoryDocument>("Inventory", inventorySchema);
