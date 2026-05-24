import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/mongodb";
import { Inventory } from "@/models/Inventory";
import { Product } from "@/models/Product";
import { Warehouse } from "@/models/Warehouse";

export async function GET() {
  try {
    await connectToDatabase();

    const [products, inventories, warehouses] = await Promise.all([
      Product.find().lean(),
      Inventory.find().lean(),
      Warehouse.find().lean()
    ]);

    const warehousesById = new Map(
      warehouses.map((warehouse) => [warehouse._id.toString(), warehouse])
    );

    const productsWithInventory = products.map((product) => {
      const productInventories = inventories
        .filter((inventory) => inventory.productId.toString() === product._id.toString())
        .map((inventory) => {
          const warehouse = warehousesById.get(inventory.warehouseId.toString());

          return {
            inventoryId: inventory._id.toString(),
            warehouseId: inventory.warehouseId.toString(),
            warehouseName: warehouse?.name ?? null,
            totalUnits: inventory.totalUnits,
            reservedUnits: inventory.reservedUnits,
            availableStock: inventory.totalUnits - inventory.reservedUnits
          };
        });

      return {
        id: product._id.toString(),
        name: product.name,
        sku: product.sku,
        inventory: productInventories
      };
    });

    return NextResponse.json({ products: productsWithInventory });
  } catch (error) {
    return handleApiError(error);
  }
}
