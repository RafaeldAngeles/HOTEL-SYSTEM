export type ReservationStatus =
  | "reservado"
  | "disponivel"
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

/** Payload de POST /reservation no backend NestJS (CreateReservationDto). */
export interface CreateReservationPayload {
  room_id: number;
  start_date: string; // ISO date (YYYY-MM-DD)
  end_date: string; // ISO date (YYYY-MM-DD)
  guests: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_cpf?: string;
  notes?: string;
}

/** Subconjunto da Reservation retornada pelo backend que o front consome. */
export interface Reservation {
  id_reservation: number;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  guests: number;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_cpf: string | null;
  notes: string | null;
  created: string;
}
