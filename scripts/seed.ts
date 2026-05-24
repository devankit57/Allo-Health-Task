import "dotenv/config";
import mongoose from "mongoose";

import { connectToDatabase } from "../lib/mongodb";
import { Inventory } from "../models/Inventory";
import { Product } from "../models/Product";
import { Reservation } from "../models/Reservation";
import { Warehouse } from "../models/Warehouse";

async function seed() {
  await connectToDatabase();

  await Promise.all([
    Reservation.deleteMany({}),
    Inventory.deleteMany({}),
    Product.deleteMany({}),
    Warehouse.deleteMany({})
  ]);

  const [products, warehouses] = await Promise.all([
    Product.insertMany([
      { name: "Wireless Mouse", sku: "WM-1001" },
      { name: "Mechanical Keyboard", sku: "MK-2001" }
    ]),
    Warehouse.insertMany([
      { name: "North Hub", location: "New Delhi" },
      { name: "South Hub", location: "Bengaluru" }
    ])
  ]);

  await Inventory.insertMany([
    {
      productId: products[0]._id,
      warehouseId: warehouses[0]._id,
      totalUnits: 5,
      reservedUnits: 0
    },
    {
      productId: products[0]._id,
      warehouseId: warehouses[1]._id,
      totalUnits: 3,
      reservedUnits: 0
    },
    {
      productId: products[1]._id,
      warehouseId: warehouses[0]._id,
      totalUnits: 8,
      reservedUnits: 0
    }
  ]);

  console.log("Seed completed successfully.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });