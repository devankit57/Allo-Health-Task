import "dotenv/config";
import mongoose from "mongoose";

import { connectToDatabase } from "../lib/mongodb";
import { Inventory } from "../models/Inventory";
import { Product } from "../models/Product";
import { Warehouse } from "../models/Warehouse";

async function seedMore() {
  await connectToDatabase();

  const productInputs = [
    { name: '27" Monitor', sku: "MN-3001" },
    { name: "USB-C Docking Station", sku: "DS-4001" }
  ];

  const warehouseInputs = [
    { name: "East Hub", location: "Kolkata" },
    { name: "West Hub", location: "Mumbai" }
  ];

  const products = await Promise.all(
    productInputs.map((product) =>
      Product.findOneAndUpdate({ sku: product.sku }, product, {
        new: true,
        upsert: true
      })
    )
  );

  const warehouses = await Promise.all(
    warehouseInputs.map((warehouse) =>
      Warehouse.findOneAndUpdate({ name: warehouse.name }, warehouse, {
        new: true,
        upsert: true
      })
    )
  );

  const inventoryInputs = [
    {
      productId: products[0]._id,
      warehouseId: warehouses[0]._id,
      totalUnits: 6,
      reservedUnits: 0
    },
    {
      productId: products[0]._id,
      warehouseId: warehouses[1]._id,
      totalUnits: 4,
      reservedUnits: 0
    },
    {
      productId: products[1]._id,
      warehouseId: warehouses[0]._id,
      totalUnits: 7,
      reservedUnits: 0
    },
    {
      productId: products[1]._id,
      warehouseId: warehouses[1]._id,
      totalUnits: 5,
      reservedUnits: 0
    }
  ];

  await Promise.all(
    inventoryInputs.map((inventory) =>
      Inventory.findOneAndUpdate(
        {
          productId: inventory.productId,
          warehouseId: inventory.warehouseId
        },
        inventory,
        {
          new: true,
          upsert: true
        }
      )
    )
  );

  console.log("Additional seed completed successfully.");
}

seedMore()
  .catch((error) => {
    console.error("Additional seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
