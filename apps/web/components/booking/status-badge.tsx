import { Badge } from "@/components/ui/badge";
import {
  bookingStatusLabel,
  paymentStatusLabel,
  refundStatusLabel,
} from "@/lib/format";
import type {
  BookingStatus,
  PaymentStatus,
  RefundStatus,
} from "@/lib/mock-data";

const bookingVariant = {
  PENDING: "pending",
  CONFIRMED: "success",
  CHECKED_IN: "info",
  CHECKED_OUT: "secondary",
  CANCELLED: "destructive",
} as const;

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={bookingVariant[status]}>{bookingStatusLabel[status]}</Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant={
        status === "PAID"
          ? "success"
          : status === "FAILED"
            ? "destructive"
            : "pending"
      }
    >
      {paymentStatusLabel[status]}
    </Badge>
  );
}

export function RefundStatusBadge({ status }: { status: RefundStatus }) {
  return (
    <Badge
      variant={
        status === "APPROVED"
          ? "success"
          : status === "REJECTED"
            ? "destructive"
            : "pending"
      }
    >
      {refundStatusLabel[status]}
    </Badge>
  );
}
