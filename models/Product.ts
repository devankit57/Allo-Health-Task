import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const Product: Model<ProductDocument> =
  models.Product || model<ProductDocument>("Product", productSchema);
