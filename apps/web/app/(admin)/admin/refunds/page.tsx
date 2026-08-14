import { Check, X } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
import { RefundStatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatVnd } from "@/lib/format";
import { refunds } from "@/lib/mock-data";

export default function AdminRefundsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý yêu cầu hoàn tiền"
        subtitle="Duyệt hoặc từ chối yêu cầu hủy / hoàn tiền của khách"
      />
      <div className="grid gap-3 md:grid-cols-[200px_1fr]">
        <Select defaultValue="REQUESTED">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="REQUESTED">Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
            <SelectItem value="REJECTED">Từ chối</SelectItem>
          </SelectContent>
        </Select>
        <Input defaultValue="RF-01" placeholder="Tìm khách / mã hoàn tiền" />
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Khách</TableHead>
              <TableHead>Đơn</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.map((refund) => (
              <TableRow key={refund.id}>
                <TableCell className="font-medium">{refund.id}</TableCell>
                <TableCell>{refund.customer_name}</TableCell>
                <TableCell>{refund.booking_id}</TableCell>
                <TableCell>{formatVnd(refund.refund_amount)}</TableCell>
                <TableCell>{refund.reason}</TableCell>
                <TableCell>
                  <RefundStatusBadge status={refund.status} />
                </TableCell>
                <TableCell>
                  {refund.status === "REQUESTED" ? (
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Check />
                        Duyệt
                      </Button>
                      <Button variant="destructive" size="sm">
                        <X />
                        Từ chối
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Đã xử lý
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <AdminPagination info="Hiển thị 1–2 / 2 yêu cầu" />
      </div>
    </div>
  );
}
