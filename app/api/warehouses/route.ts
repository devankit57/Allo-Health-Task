import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/mongodb";
import { Warehouse } from "@/models/Warehouse";

export async function GET() {
  try {
    await connectToDatabase();

    const warehouses = await Warehouse.find().lean();

    return NextResponse.json({
      warehouses: warehouses.map((warehouse) => ({
        id: warehouse._id.toString(),
        name: warehouse.name,
        location: warehouse.location
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
