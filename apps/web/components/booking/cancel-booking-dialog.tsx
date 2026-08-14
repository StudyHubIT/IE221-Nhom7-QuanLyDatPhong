"use client";

import { useState } from "react";

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

export function CancelBookingDialog() {
  const [open, setOpen] = useState(false);

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
            defaultValue="Đổi lịch trình, không thể đi đúng ngày."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Đóng
          </Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>
            Gửi yêu cầu hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
