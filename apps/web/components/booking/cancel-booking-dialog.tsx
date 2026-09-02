"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useUserSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, ApiError } from "@/lib/api";

export function CancelBookingDialog({ bookingId }: { bookingId: number }) {
  const router = useRouter();
  const { session } = useUserSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function onSubmit() {
    setError(null);
    setIsSending(true);
    try {
      await apiFetch(`/api/v1/bookings/${bookingId}/cancel`, {
        method: "POST",
        token: session?.token,
        body: JSON.stringify({ reason }),
      });
      setOpen(false);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gửi yêu cầu hủy thất bại",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Hủy đặt phòng</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận hủy đặt phòng</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do hủy. Hệ thống sẽ tạo yêu cầu hoàn tiền
            (REQUESTED) để admin duyệt.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="cancel-reason">Lý do hủy</Label>
          <Textarea
            id="cancel-reason"
            placeholder="Ví dụ: Đổi lịch trình, không thể đi đúng ngày."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Đóng
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={isSending || reason.trim() === ""}
          >
            {isSending ? "Đang gửi..." : "Gửi yêu cầu hủy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
