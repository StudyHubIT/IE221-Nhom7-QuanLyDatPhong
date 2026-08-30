export type RoomType = {
  id: number;
  ten_loai: string;
  gia_co_ban: number;
  description: string | null;
  image: string | null;
  room_count: number;
};

export type Room = {
  id: number;
  so_phong: string;
  loai_phong_id: number;
  trang_thai: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
};

export type AvailabilityItem = Room & {
  ten_loai: string;
  gia_co_ban: number;
  available: boolean;
};

export type RoomTypeDetail = RoomType & {
  available_rooms: Room[];
};

export const defaultStay = {
  checkIn: "2026-08-14",
  checkOut: "2026-08-16",
  count: 1,
};
