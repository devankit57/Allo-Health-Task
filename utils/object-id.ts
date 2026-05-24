import mongoose from "mongoose";

import { ValidationAppError } from "@/lib/errors";

export function ensureObjectId(value: string, fieldName: string) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ValidationAppError(`${fieldName} must be a valid ObjectId.`);
  }
}
