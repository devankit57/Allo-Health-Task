# Allo Inventory

**Multi-warehouse inventory reservation system with race-condition-safe checkouts.**

Built as a take-home task for Allo Health. The core problem: multiple concurrent users trying to reserve the same unit of stock should never both succeed. This system solves that with distributed Redis locking, MongoDB transactions, and an expiry-based reservation lifecycle.

---

## What It Does

- **Reserve stock** across multiple warehouses with oversell protection
- **Confirm or release** reservations through a clean state machine (`PENDING → CONFIRMED | RELEASED | EXPIRED`)
- **Auto-expire** stale reservations via a cron endpoint that returns stock to available inventory
- **Live stock math** — `availableStock = totalUnits - reservedUnits` is always consistent

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | MongoDB (with replica set for transactions) |
| Cache / Lock | Redis (distributed locking via Redlock) |
| Validation | Zod |

---

## How Race Conditions Are Prevented

The critical path for `POST /api/reservations` runs like this:

```
1. Acquire a per-inventory Redis lock (Redlock, ~5s TTL)
2. Open a MongoDB session + transaction
3. Read current inventory inside the transaction
4. Check availableStock >= requested quantity
5. Atomically increment reservedUnits
6. Write reservation document (status: PENDING, expiresAt: now + 10min)
7. Commit transaction
8. Release Redis lock
```

If two requests race on the same inventory item, one waits for the lock. If the lock is already held and the first request consumed the last unit, the second gets a `409 Conflict`. No oversell is possible.

---

## Project Structure


<img src="https://i.ibb.co/mZPM8Pq/sys-arch-allo-health-main.png">


---

## Reservation Lifecycle

```
                    ┌─────────┐
                    │ PENDING │
                    └────┬────┘
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
      CONFIRMED       RELEASED       EXPIRED
   (stock deducted) (stock freed)  (stock freed)
```

- **Confirm** — decrements both `totalUnits` and `reservedUnits`
- **Release** — decrements only `reservedUnits`
- **Expire** — cron job decrements only `reservedUnits`, fires on `POST /api/cron/release-expired`

---

## Local Setup

### Prerequisites

- Node.js 20+
- MongoDB with a replica set (required for transactions)
- Redis

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
REDIS_URL=redis://default:<redis_password>@<redis_host>:<redis_port>
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

> **Note:** Plain standalone MongoDB won't work — multi-document transactions require a replica set. Use a MongoDB Atlas cluster or run locally with `--replSet rs0`.

### 3. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:3000`.

---

## API Reference

### Products

```
GET /api/products
```

Returns all products with per-warehouse inventory and computed `availableStock`.

---

### Warehouses

```
GET /api/warehouses
```

Returns all warehouses.

---

### Reservations

```
POST /api/reservations
Content-Type: application/json

{
  "productId": "<id>",
  "warehouseId": "<id>",
  "quantity": 1
}
```

Returns `201` with a `PENDING` reservation and an `expiresAt` 10 minutes out. Returns `409` if stock is insufficient or a lock conflict occurs.

---

```
POST /api/reservations/:id/confirm
```

Confirms a `PENDING` reservation. Decrements `totalUnits` and `reservedUnits`. Returns `409` if already confirmed, released, or expired.

---

```
POST /api/reservations/:id/release
```

Releases a `PENDING` reservation. Decrements only `reservedUnits`.

---

### Cron

```
POST /api/cron/release-expired
```

Finds all `PENDING` reservations past their `expiresAt`, decrements `reservedUnits`, and marks them `EXPIRED`.

```json
{
  "processed": 2,
  "expiredCount": 2,
  "skippedCount": 0
}
```

---

## Validation Errors

| Scenario | Status |
|---|---|
| Missing or empty `productId` / `warehouseId` | `400` |
| `quantity <= 0` | `400` |
| Malformed JSON body | `400` |
| Stock insufficient | `409` |
| Redis lock contention | `409` |
| Confirming a non-PENDING reservation | `409` |

---

## Key Invariants

These should always hold:

- `availableStock = totalUnits - reservedUnits`
- Creating a reservation → `reservedUnits` increases
- Confirming a reservation → both `totalUnits` and `reservedUnits` decrease
- Releasing or expiring → only `reservedUnits` decreases
- Two simultaneous requests for the last unit never both succeed
