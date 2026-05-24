import { Boxes, Clock3, ExternalLink, MapPin, Package2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Reservation } from "@/models/Reservation";
import { Warehouse } from "@/models/Warehouse";
import { type UserReservationView } from "@/types/frontend";

function getBadgeVariant(status: UserReservationView["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "success";

    case "RELEASED":
      return "secondary";

    case "EXPIRED":
      return "destructive";

    default:
      return "default";
  }
}

function formatStatus(status: UserReservationView["status"]) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

async function getUserReservations(
  userEmail: string
): Promise<UserReservationView[]> {
  await connectToDatabase();

  const reservations = await Reservation.find({
    userEmail: userEmail.toLowerCase()
  })
    .sort({ createdAt: -1 })
    .lean();

  const productIds = [
    ...new Set(
      reservations.map((reservation) => reservation.productId.toString())
    )
  ];

  const warehouseIds = [
    ...new Set(
      reservations.map((reservation) => reservation.warehouseId.toString())
    )
  ];

  const [products, warehouses] = await Promise.all([
    Product.find({ _id: { $in: productIds } }).lean(),
    Warehouse.find({ _id: { $in: warehouseIds } }).lean()
  ]);

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product])
  );

  const warehouseMap = new Map(
    warehouses.map((warehouse) => [warehouse._id.toString(), warehouse])
  );

  return reservations.map((reservation) => {
    const product = productMap.get(reservation.productId.toString());

    const warehouse = warehouseMap.get(
      reservation.warehouseId.toString()
    );

    return {
      id: reservation._id.toString(),
      productId: reservation.productId.toString(),
      productName: product?.name ?? "Unknown product",
      productSku: product?.sku ?? "N/A",
      warehouseId: reservation.warehouseId.toString(),
      warehouseName: warehouse?.name ?? "Unknown warehouse",
      warehouseLocation: warehouse?.location ?? "Unknown location",
      userEmail: reservation.userEmail,
      quantity: reservation.quantity,
      status: reservation.status,
      expiresAt: new Date(reservation.expiresAt),
      createdAt: new Date(reservation.createdAt)
    };
  });
}

export default async function UserReservedPage() {
  const session = await auth();

  const userEmail = session?.user?.email?.trim().toLowerCase();

  if (!userEmail) {
    redirect("/login?callbackUrl=/user-reserved");
  }

  const reservations = await getUserReservations(userEmail);

  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "CONFIRMED"
  );

  const otherReservations = reservations.filter(
    (reservation) => reservation.status !== "CONFIRMED"
  );

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="space-y-8">
        {/* HEADER */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            User Reserved
          </p>

          <h1 className="text-4xl font-black text-slate-950 dark:text-white">
            Your reservation history
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Reservations linked to{" "}
            <span className="font-semibold">{userEmail}</span>
            from the MongoDB reservations collection.
          </p>
        </div>

        {/* EMPTY STATE */}
        {reservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <Boxes className="h-10 w-10 text-slate-900 dark:text-white" />

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                  No reservations yet
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Reserve inventory from the home page and your entries will
                  appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* CONFIRMED RESERVATIONS */}
            {confirmedReservations.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                    Confirmed Reservations
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Successfully confirmed inventory reservations.
                  </p>
                </div>

                <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 dark:bg-slate-900">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              Product
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              SKU
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              Quantity
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              Warehouse
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              Created
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {confirmedReservations.map((reservation) => (
                            <tr
                              key={reservation.id}
                              className="border-t border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/40"
                            >
                              {/* PRODUCT */}
                              <td className="px-6 py-5">
                                <div>
                                  <p className="font-bold text-slate-950 dark:text-white">
                                    {reservation.productName}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    ID: {reservation.id}
                                  </p>
                                </div>
                              </td>

                              {/* SKU */}
                              <td className="px-6 py-5">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">
                                  {reservation.productSku}
                                </span>
                              </td>

                              {/* QUANTITY */}
                              <td className="px-6 py-5">
                                <div className="flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                  <Package2 className="h-4 w-4" />
                                  {reservation.quantity}
                                </div>
                              </td>

                              {/* WAREHOUSE */}
                              <td className="px-6 py-5">
                                <div>
                                  <p className="font-semibold text-slate-950 dark:text-white">
                                    {reservation.warehouseName}
                                  </p>

                                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                    <MapPin className="h-3 w-3" />
                                    {reservation.warehouseLocation}
                                  </div>
                                </div>
                              </td>

                              {/* CREATED */}
                              <td className="px-6 py-5">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                    {reservation.createdAt.toLocaleDateString()}
                                  </p>

                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {reservation.createdAt.toLocaleTimeString()}
                                  </p>
                                </div>
                              </td>

                              {/* STATUS */}
                              <td className="px-6 py-5">
                                <Badge
                                  variant={getBadgeVariant(
                                    reservation.status
                                  )}
                                >
                                  {formatStatus(reservation.status)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* PENDING / RELEASED / EXPIRED */}
            {otherReservations.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                    Pending & Other Reservations
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Reservations waiting for confirmation or already completed.
                  </p>
                </div>

                <div className="grid gap-5">
                  {otherReservations.map((reservation) => (
                    <Card
                      key={reservation.id}
                      className="overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                      <CardContent className="grid gap-5 p-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                        {/* LEFT SIDE */}
                        <div className="space-y-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                                {reservation.productName}
                              </h2>

                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                SKU: {reservation.productSku}
                              </p>
                            </div>

                            <Badge
                              variant={getBadgeVariant(reservation.status)}
                            >
                              {formatStatus(reservation.status)}
                            </Badge>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            {/* QUANTITY */}
                            <div className="rounded-[20px] border border-black/8 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/50">
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                <Package2 className="h-4 w-4" />
                                Quantity
                              </div>

                              <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                                {reservation.quantity}
                              </p>
                            </div>

                            {/* WAREHOUSE */}
                            <div className="rounded-[20px] border border-black/8 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/50">
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                <MapPin className="h-4 w-4" />
                                Warehouse
                              </div>

                              <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">
                                {reservation.warehouseName}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {reservation.warehouseLocation}
                              </p>
                            </div>

                            {/* CREATED */}
                            <div className="rounded-[20px] border border-black/8 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/50">
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                <Clock3 className="h-4 w-4" />
                                Created
                              </div>

                              <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">
                                {reservation.createdAt.toLocaleDateString()}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {reservation.createdAt.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          {/* PENDING BUTTON */}
                          {reservation.status === "PENDING" && (
                            <div className="pt-2">
                              <Link
                                href={`/reservation/${reservation.id}`}
                              >
                                <Button className="rounded-xl font-semibold">
                                  Open Reservation
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="rounded-[24px] border border-black/8 bg-black px-5 py-4 text-white dark:border-white/10 dark:bg-white dark:text-black">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                            Reservation ID
                          </p>

                          <p className="mt-2 break-all text-sm font-semibold">
                            {reservation.id}
                          </p>

                          <p className="mt-4 text-xs opacity-70">
                            Expires:{" "}
                            {reservation.expiresAt.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}