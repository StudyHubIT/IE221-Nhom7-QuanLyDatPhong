"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";

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

type ConfirmDeleteDialogProps = {
  title: string;
  description: string;
  triggerLabel?: string;
  confirmLabel?: string;
  blocked?: boolean;
  trigger?: ReactNode;
  onConfirm?: () => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
};

export function ConfirmDeleteDialog({
  title,
  description,
  triggerLabel = "Xóa",
  confirmLabel = "Xóa",
  blocked = false,
  trigger,
  onConfirm,
  isSubmitting = false,
  error,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive" size="sm">
            <Trash2 />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" disabled={isSubmitting} onClick={() => setOpen(false)}>
            {blocked ? "Đóng" : "Hủy"}
          </Button>
          {blocked ? null : (
            <Button variant="destructive" disabled={isSubmitting} onClick={onConfirm}>
              {isSubmitting ? "Đang xử lý..." : confirmLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
