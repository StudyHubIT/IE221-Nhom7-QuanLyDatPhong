"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Loader2,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";

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

const QUICK_REASONS = [
  "Thay đổi lịch trình chuyến đi",
  "Trùng vé máy bay / tàu xe",
  "Lý do sức khỏe / cá nhân",
  "Tìm được lựa chọn khác",
];

export function CancelBookingDialog({ bookingId }: { bookingId: number }) {
  const router = useRouter();
  const { session } = useUserSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function onSubmit() {
    if (isSending) return;
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
        err instanceof ApiError ? err.message : "Gửi yêu cầu hủy thất bại"
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive text-xs font-extrabold h-9 px-3.5 gap-1.5 transition-all"
        >
          <XCircle className="size-3.5" /> Hủy đặt phòng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[32px] border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl p-6 md:p-8 space-y-5 overflow-hidden">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="mx-auto sm:mx-0 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-inner">
            <AlertCircle className="size-7 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-xl font-black text-foreground tracking-tight">
              Xác Nhận Yêu Cầu Hủy Phòng
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Vui lòng cung cấp lý do hủy. Hệ thống sẽ tạo yêu cầu hoàn tiền gửi đến Ban Quản Lý Resort duyệt.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="cancel-reason" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="size-3.5 text-primary" /> Lý do hủy phòng (Bắt buộc)
          </Label>

          {/* Quick Reasons Chips */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className="rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/60 hover:border-primary/30 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-all text-left"
              >
                + {r}
              </button>
            ))}
          </div>

          <Textarea
            id="cancel-reason"
            placeholder="Nhập lý do chi tiết của bạn tại đây..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-2xl border-border/80 text-xs font-medium focus:ring-2 focus:ring-destructive/30 resize-none h-24 p-3.5"
          />
        </div>

        {/* Notice Badge */}
        <div className="flex items-start gap-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
          <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-500" />
          <p className="leading-relaxed">
            Yêu cầu hủy sẽ được xem xét và xử lý hoàn tiền theo chính sách áp dụng của Resort trong vòng 24h.
          </p>
        </div>

        {error ? (
          <div className="flex items-center gap-2 text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-2xl font-bold text-xs h-11 border-border/80 px-5"
          >
            Đóng cửa sổ
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={isSending || reason.trim() === ""}
            className="rounded-2xl font-extrabold text-xs h-11 px-6 shadow-lg shadow-destructive/25 flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Đang gửi yêu cầu...
              </>
            ) : (
              <>
                <Sparkles className="size-4 fill-white/20" /> Gửi yêu cầu hủy ngay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
