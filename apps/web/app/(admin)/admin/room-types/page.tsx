"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
import { RoomTypeRowActions } from "@/components/admin/room-type-row-actions";
import { useAdminSession } from "@/components/auth/session-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, apiFetch } from "@/lib/api";
import { formatVnd } from "@/lib/format";
import type { Paginated, RoomType } from "@/lib/room-api-types";

export default function AdminRoomTypesPage() {
  const { session } = useAdminSession();
  const [query, setQuery] = useState(""); const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<RoomType> | null>(null);
  const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    setIsLoading(true); setError(null);
    const params = new URLSearchParams({ page: String(page), page_size: "20" }); if (query.trim()) params.set("q", query.trim());
    try { setData(await apiFetch<Paginated<RoomType>>(`/api/v1/admin/room-types?${params}`, { token: session.token })); }
    catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : "Không thể tải loại phòng."); }
    finally { setIsLoading(false); }
  }, [page, query, session]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  const first = data?.total ? (data.page - 1) * data.page_size + 1 : 0;
  const last = data ? Math.min(data.total, data.page * data.page_size) : 0;
  return <div className="space-y-6"><AdminPageHeader title="Quản lý loại phòng" subtitle="Tạo, sửa, xóa loại phòng và giá cơ bản" actionLabel="Thêm loại phòng" actionHref="/admin/room-types/new" />
    <div className="grid gap-1.5"><Label htmlFor="room-type-search">Tìm loại phòng</Label><Input id="room-type-search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm loại phòng" /></div>
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
    <div className="rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Tên loại</TableHead><TableHead>Giá cơ bản</TableHead><TableHead>Số phòng</TableHead><TableHead /></TableRow></TableHeader><TableBody>
      {isLoading ? <TableRow><TableCell colSpan={4}>Đang tải...</TableCell></TableRow> : data?.items.length ? data.items.map((type) => <TableRow key={type.id}><TableCell className="font-medium">{type.ten_loai}</TableCell><TableCell>{formatVnd(type.gia_co_ban)}</TableCell><TableCell>{type.room_count ?? 0}</TableCell><TableCell className="text-right"><RoomTypeRowActions id={type.id} name={type.ten_loai} token={session!.token} onDeleted={load} /></TableCell></TableRow>) : <TableRow><TableCell colSpan={4}>Không có loại phòng phù hợp.</TableCell></TableRow>}
    </TableBody></Table><AdminPagination info={`Hiển thị ${first}–${last} / ${data?.total ?? 0} loại phòng`} page={data?.page} hasPrevious={(data?.page ?? 1) > 1} hasNext={Boolean(data && data.page * data.page_size < data.total)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} /></div>
  </div>;
}
