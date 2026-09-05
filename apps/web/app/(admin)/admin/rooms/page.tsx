"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
import { RoomRowActions } from "@/components/admin/room-row-actions";
import { useAdminSession } from "@/components/auth/session-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, apiFetch } from "@/lib/api";
import { roomStatusLabel } from "@/lib/format";
import type { Paginated, Room, RoomType } from "@/lib/room-api-types";

export default function AdminRoomsPage() {
  const { session } = useAdminSession();
  const [query, setQuery] = useState(""); const [roomTypeId, setRoomTypeId] = useState("all"); const [status, setStatus] = useState("all"); const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Room> | null>(null); const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { if (!session) return; setIsLoading(true); setError(null); const params = new URLSearchParams({ page: String(page), page_size: "20" }); if (query.trim()) params.set("q", query.trim()); if (roomTypeId !== "all") params.set("loai_phong_id", roomTypeId); if (status !== "all") params.set("trang_thai", status); try { setData(await apiFetch<Paginated<Room>>(`/api/v1/admin/rooms?${params}`, { token: session.token })); } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : "Không thể tải phòng."); } finally { setIsLoading(false); } }, [page, query, roomTypeId, session, status]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => { if (!session) return; apiFetch<Paginated<RoomType>>("/api/v1/admin/room-types?page=1&page_size=100", { token: session.token }).then((response) => setRoomTypes(response.items)).catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : "Không thể tải loại phòng.")); }, [session]);
  const first = data?.total ? (data.page - 1) * data.page_size + 1 : 0; const last = data ? Math.min(data.total, data.page * data.page_size) : 0;
  const resetPage = <T,>(setter: (value: T) => void, value: T) => { setter(value); setPage(1); };
  return <div className="space-y-6"><AdminPageHeader title="Quản lý phòng" subtitle="Tạo, sửa, xóa phòng vật lý và trạng thái vận hành" actionLabel="Thêm phòng" actionHref="/admin/rooms/new" />
    <div className="grid gap-3 md:grid-cols-[200px_200px_1fr]"><Select value={roomTypeId} onValueChange={(value) => resetPage(setRoomTypeId, value)}><SelectTrigger className="w-full"><SelectValue placeholder="Loại phòng" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem>{roomTypes.map((type) => <SelectItem key={type.id} value={String(type.id)}>{type.ten_loai}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={(value) => resetPage(setStatus, value)}><SelectTrigger className="w-full"><SelectValue placeholder="Trạng thái" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="AVAILABLE">Còn trống</SelectItem><SelectItem value="OCCUPIED">Đang sử dụng</SelectItem><SelectItem value="MAINTENANCE">Bảo trì</SelectItem></SelectContent></Select><Input value={query} onChange={(event) => resetPage(setQuery, event.target.value)} placeholder="Tìm số phòng" /></div>
    {error ? <p className="text-sm text-destructive">{error}</p> : null}<div className="rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Số phòng</TableHead><TableHead>Loại phòng</TableHead><TableHead>Trạng thái</TableHead><TableHead /></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={4}>Đang tải...</TableCell></TableRow> : data?.items.length ? data.items.map((room) => <TableRow key={room.id}><TableCell className="font-medium">{room.so_phong}</TableCell><TableCell>{room.ten_loai}</TableCell><TableCell><Badge variant="success">{roomStatusLabel[room.trang_thai]}</Badge></TableCell><TableCell className="text-right"><RoomRowActions id={room.id} soPhong={room.so_phong} token={session!.token} onChanged={load} /></TableCell></TableRow>) : <TableRow><TableCell colSpan={4}>Không có phòng phù hợp.</TableCell></TableRow>}</TableBody></Table><AdminPagination info={`Hiển thị ${first}–${last} / ${data?.total ?? 0} phòng`} page={data?.page} hasPrevious={(data?.page ?? 1) > 1} hasNext={Boolean(data && data.page * data.page_size < data.total)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} /></div></div>;
}
