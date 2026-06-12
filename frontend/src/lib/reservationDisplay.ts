import type { ReservationStatus } from "@/types/reservation";

/** Rótulos, cores e formatação de apresentação das reservas. */

export const RESERVATION_STATUS: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  reservado: { label: "Reservada", className: "bg-blue-faint text-blue border-blue/20" },
  disponivel: { label: "Disponível", className: "bg-surface-2 text-ink-2 border-border-2" },
  pending: { label: "Pendente", className: "bg-amber-bg text-amber border-amber-bor" },
  confirmed: { label: "Confirmada", className: "bg-green-bg text-green border-green-bor" },
  checked_in: { label: "Check-in feito", className: "bg-blue-faint text-blue border-blue/20" },
  checked_out: { label: "Concluída", className: "bg-surface-2 text-ink-2 border-border-2" },
  cancelled: { label: "Cancelada", className: "bg-red-bg text-red border-red-bor" },
};

/** Status em que o hóspede ainda pode cancelar a reserva. */
const CANCELLABLE: ReadonlySet<ReservationStatus> = new Set([
  "reservado",
  "pending",
  "confirmed",
]);

export function canCancel(status: ReservationStatus): boolean {
  return CANCELLABLE.has(status);
}

/** Nº de noites entre duas datas ISO (0 se inválido). */
export function nightsBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(ms) || ms <= 0) return 0;
  return Math.round(ms / 86_400_000);
}

/** Data ISO → "12 jun 2026" (UTC, evita deslocamento de fuso em datas puras). */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
