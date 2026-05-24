"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getReservationSnapshot,
  saveReservationSnapshot,
  type ReservationSnapshot
} from "@/components/reservation/reservation-storage";

import { ReservationDetails } from "@/components/reservation/reservation-details";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useConfirmReservation,
  useReleaseReservation
} from "@/hooks/useReservation";

import { ApiError } from "@/lib/api";

export default function ReservationPage() {
  const params = useParams<{ id: string }>();

  const router = useRouter();

  const [reservation, setReservation] = useState<
    ReservationSnapshot | null | undefined
  >(undefined);

  const confirmMutation = useConfirmReservation();

  const releaseMutation = useReleaseReservation();

  useEffect(() => {
    if (!params.id) {
      return;
    }

    const snapshot = getReservationSnapshot(params.id);

    setReservation(snapshot);
  }, [params.id]);

  const handleExpire = () => {
    setReservation((current) => {
      if (!current || current.status !== "PENDING") {
        return current;
      }

      const next = {
        ...current,
        status: "EXPIRED" as const
      };

      saveReservationSnapshot(next);

      return next;
    });
  };

  const handleConfirm = async () => {
    if (!params.id) {
      return;
    }

    try {
      const next = await confirmMutation.mutateAsync(params.id);

      if (next && reservation) {
        const merged = {
          ...reservation,
          ...next
        };

        saveReservationSnapshot(merged);

        setReservation(merged);
      }

      toast.success("Reservation confirmed successfully.");

      // REDIRECT TO USER RESERVED PAGE
      window.setTimeout(() => {
        router.push("/user-reserved");
      }, 1000);
    } catch (error) {
      if (error instanceof ApiError && error.status === 410) {
        toast.error("Reservation expired before confirmation.");

        handleExpire();

        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to confirm reservation."
      );
    }
  };

  const handleRelease = async () => {
    if (!params.id) {
      return;
    }

    try {
      const next = await releaseMutation.mutateAsync(params.id);

      if (next && reservation) {
        const merged = {
          ...reservation,
          ...next
        };

        saveReservationSnapshot(merged);

        setReservation(merged);
      }

      toast.success("Reservation released.");

      window.setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (error) {
      if (error instanceof ApiError && error.status === 410) {
        toast.error("Reservation has already expired.");

        handleExpire();

        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to cancel reservation."
      );
    }
  };

  if (reservation === undefined) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-8 w-64" />

            <Skeleton className="h-28 w-full" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-32 w-full" />

              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (reservation === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Card>
          <CardContent className="space-y-4 p-10">
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">
              Reservation not found
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              This reservation may have expired or does not exist anymore.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ReservationDetails
        reservation={reservation}
        isConfirming={confirmMutation.isPending}
        isReleasing={releaseMutation.isPending}
        onConfirm={handleConfirm}
        onRelease={handleRelease}
        onExpire={handleExpire}
      />
    </main>
  );
}