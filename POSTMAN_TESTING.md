# MongoDB Seeding And Postman Testing Guide

This project is backend-first, so the quickest way to validate it is:

1. Set environment variables.
2. Seed MongoDB with sample products, warehouses, and inventory.
3. Start the Next.js server.
4. Test each API route from Postman.

## 1. Prerequisites

Make sure these are available:

- Node.js 20+
- MongoDB running locally or a MongoDB Atlas connection string
- Redis running locally or a hosted Redis URL

Install dependencies from the project root:

```powershell
npm install
```

## 2. Configure Environment Variables

Create a `.env.local` file in the project root and copy the values from `.env.example`.

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/allo_inventory
REDIS_URL=redis://default:your-password@127.0.0.1:6379
REDIS_TOKEN=optional-provider-token
```

Notes:

- `MONGODB_URI` must point to a MongoDB deployment that supports transactions. For local development, use a replica set-enabled MongoDB instance.
- `REDIS_URL` is required for distributed locking.
- `REDIS_TOKEN` is included for providers that issue a separate token, even though the current Redis client uses `REDIS_URL`.

## 3. Seed MongoDB

Run the seed script from the project root:

```powershell
npm run seed
```

What the seed script does:

- Deletes existing `reservations`
- Deletes existing `inventory`
- Deletes existing `products`
- Deletes existing `warehouses`
- Inserts sample products
- Inserts sample warehouses
- Inserts sample inventory records

Expected success output:

```text
Seed completed successfully.
```

## 4. Start The API Server

Run:

```powershell
npm run dev
```

Default local base URL:

```text
http://localhost:3000
```

## 5. Verify Seeded Data In MongoDB

After seeding, you should have:

- 2 products
- 2 warehouses
- 3 inventory records

Seeded products:

- `Wireless Mouse`
- `Mechanical Keyboard`

Seeded warehouses:

- `North Hub`
- `South Hub`

Seeded inventory:

- `Wireless Mouse` in `North Hub`: `totalUnits = 5`, `reservedUnits = 0`
- `Wireless Mouse` in `South Hub`: `totalUnits = 3`, `reservedUnits = 0`
- `Mechanical Keyboard` in `North Hub`: `totalUnits = 8`, `reservedUnits = 0`

## 6. Postman Setup

Create a new Postman collection, for example: `Inventory Reservation API`.

Create a collection variable:

- `baseUrl = http://localhost:3000`

Then use `{{baseUrl}}` in every request URL.

## 7. Test GET /api/products

Method:

```text
GET
```

URL:

```text
{{baseUrl}}/api/products
```

Expected response:

- HTTP `200`
- A `products` array
- Inventory grouped under each product
- `availableStock = totalUnits - reservedUnits`

Example:

```json
{
  "products": [
    {
      "id": "PRODUCT_ID",
      "name": "Wireless Mouse",
      "sku": "WM-1001",
      "inventory": [
        {
          "inventoryId": "INVENTORY_ID",
          "warehouseId": "WAREHOUSE_ID",
          "warehouseName": "North Hub",
          "totalUnits": 5,
          "reservedUnits": 0,
          "availableStock": 5
        }
      ]
    }
  ]
}
```

Save from this response:

- one `productId`
- one `warehouseId`

You will use them in the reservation requests.

## 8. Test GET /api/warehouses

Method:

```text
GET
```

URL:

```text
{{baseUrl}}/api/warehouses
```

Expected response:

- HTTP `200`
- A `warehouses` array

Example:

```json
{
  "warehouses": [
    {
      "id": "WAREHOUSE_ID",
      "name": "North Hub",
      "location": "New Delhi"
    }
  ]
}
```

## 9. Test POST /api/reservations

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/reservations
```

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "productId": "PUT_PRODUCT_ID_HERE",
  "warehouseId": "PUT_WAREHOUSE_ID_HERE",
  "quantity": 1
}
```

Expected response:

- HTTP `201`
- `reservation.status = "PENDING"`
- `expiresAt` about 10 minutes in the future

Example:

```json
{
  "reservation": {
    "id": "RESERVATION_ID",
    "productId": "PRODUCT_ID",
    "warehouseId": "WAREHOUSE_ID",
    "quantity": 1,
    "status": "PENDING",
    "expiresAt": "2026-05-24T12:00:00.000Z",
    "createdAt": "2026-05-24T11:50:00.000Z"
  }
}
```

Save:

- `reservation.id`

## 10. Test POST /api/reservations/:id/confirm

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/reservations/PUT_RESERVATION_ID_HERE/confirm
```

Expected response:

- HTTP `200`
- `status = "CONFIRMED"`

What this does internally:

- checks reservation is still `PENDING`
- checks reservation is not expired
- decrements `totalUnits`
- decrements `reservedUnits`
- marks the reservation as `CONFIRMED`

## 11. Test POST /api/reservations/:id/release

Create a fresh reservation first, because a `CONFIRMED` reservation cannot be released.

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/reservations/PUT_RESERVATION_ID_HERE/release
```

Expected response:

- HTTP `200`
- `status = "RELEASED"`

What this does internally:

- checks reservation is `PENDING`
- decrements `reservedUnits`
- marks the reservation as `RELEASED`

## 12. Test POST /api/cron/release-expired

This route is meant to expire old pending reservations and return stock.

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/cron/release-expired
```

Expected response:

- HTTP `200`
- counts for `processed`, `expiredCount`, and `skippedCount`

Example:

```json
{
  "processed": 1,
  "expiredCount": 1,
  "skippedCount": 0
}
```

### How to create an expired reservation for testing

Option 1:

- Create a reservation
- Wait more than 10 minutes
- Call the cron route

Option 2:

- Update the reservation document directly in MongoDB and set `expiresAt` to a past time
- Then call the cron route

## 13. Test Validation Errors

### Invalid reservation payload

Request:

```json
{
  "productId": "",
  "warehouseId": "",
  "quantity": 0
}
```

Expected response:

- HTTP `400`

### Invalid JSON body

Send malformed JSON in Postman, for example:

```json
{
  "productId": "abc",
```

Expected response:

- HTTP `400`
- error message for invalid JSON

## 14. Test Conflict Behavior

### Insufficient stock

If available stock is lower than the requested quantity:

```json
{
  "productId": "PUT_PRODUCT_ID_HERE",
  "warehouseId": "PUT_WAREHOUSE_ID_HERE",
  "quantity": 999
}
```

Expected response:

- HTTP `409`

### Lock contention

If two requests try to reserve the same inventory at nearly the same time, one may fail because:

- the Redis lock is already held, or
- the first request already consumed the final available unit

Expected result:

- one request succeeds
- the competing request returns HTTP `409`

## 15. Manual Concurrency Test In Postman

To test the most important rule, use inventory with only `1` available unit.

### Prepare the data

You can either:

- reduce a seeded inventory document to `totalUnits = 1`, `reservedUnits = 0` in MongoDB
- or repeatedly reserve inventory until only `1` unit remains

### Run the test

Create two Postman tabs with the same request:

```json
{
  "productId": "PUT_PRODUCT_ID_HERE",
  "warehouseId": "PUT_WAREHOUSE_ID_HERE",
  "quantity": 1
}
```

Both should point to:

```text
POST {{baseUrl}}/api/reservations
```

Send them as close together as possible.

Expected result:

- exactly one request returns `201`
- exactly one request returns `409`

This is the key correctness check for oversell protection.

## 16. Recommended Postman Test Flow

Run requests in this order:

1. `GET /api/products`
2. `GET /api/warehouses`
3. `POST /api/reservations`
4. `POST /api/reservations/:id/confirm`
5. `POST /api/reservations`
6. `POST /api/reservations/:id/release`
7. `POST /api/reservations`
8. wait until expired or manually backdate it in MongoDB
9. `POST /api/cron/release-expired`

## 17. Common Issues

### Transactions fail locally

MongoDB transactions require a replica set. If you use plain standalone MongoDB, transaction-based routes may fail.

### Redis connection fails

Double-check:

- `REDIS_URL`
- password in the URL
- Redis server is reachable

### Reservation not found

You may be using:

- a deleted reservation
- a malformed ObjectId
- a reservation ID from a different seeded run

### Confirm or release returns conflict

This is expected if the reservation is no longer `PENDING`.

Examples:

- already confirmed
- already released
- already expired

## 18. Useful Sample Response Checks

When testing, confirm these invariants:

- `availableStock = totalUnits - reservedUnits`
- creating a reservation increases `reservedUnits`
- confirming a reservation decreases both `totalUnits` and `reservedUnits`
- releasing a reservation decreases only `reservedUnits`
- expiring a reservation decreases only `reservedUnits`
- two simultaneous requests for the last unit do not both succeed
