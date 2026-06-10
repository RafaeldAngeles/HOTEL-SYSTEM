export type RoomType = "single" | "double" | "suite";

export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";

/** Espelha src/room/entities/room.entity.ts do backend. */
export interface Room {
  room_id: number;
  number_room: number;
  /** Decimal: o TypeORM serializa como string (ex.: "250.00"). */
  price_room: string | number;
  description_room: string;
  capacity_room: number;
  type: RoomType;
  status: RoomStatus;
  floor: number | null;
  image_url: string | null;
}

/** Espelha src/common/interfaces/paginated-result.interface.ts. */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
