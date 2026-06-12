import Link from "next/link";
import type { ReservationWithRoom } from "@/types/reservation";
import { TYPE_LABEL, formatPrice } from "@/lib/roomDisplay";
import {
  RESERVATION_STATUS,
  canCancel,
  formatDate,
  nightsBetween,
} from "@/lib/reservationDisplay";
import { CancelButton } from "./CancelButton";

export function ReservationCard({
  reservation,
}: {
  reservation: ReservationWithRoom;
}) {
  const { room } = reservation;
  const status = RESERVATION_STATUS[reservation.status];
  const nights = nightsBetween(reservation.start_date, reservation.end_date);
  const total = nights * Number(room.price_room);

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-stretch">
      {/* Thumbnail do quarto */}
      <Link
        href={`/rooms/${room.room_id}`}
        className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg bg-surface-2 sm:aspect-square sm:w-32 focus-visible:outline-none focus-visible:shadow-focus"
      >
        {room.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.image_url}
            alt={`Quarto ${room.number_room}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)" }}
          />
        )}
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-label text-ink-3">
              Reserva #{reservation.id_reservation} · {TYPE_LABEL[room.type]}
            </p>
            <h3 className="mt-0.5 font-display text-[19px] font-medium text-ink">
              Quarto {room.number_room}
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-2">
          <div className="flex items-center gap-1.5">
            <CalendarIcon />
            <span>
              {formatDate(reservation.start_date)} —{" "}
              {formatDate(reservation.end_date)}
            </span>
          </div>
          <span className="text-ink-3">
            {nights} {nights === 1 ? "noite" : "noites"}
          </span>
          <span className="text-ink-3">
            {reservation.guests}{" "}
            {reservation.guests === 1 ? "hóspede" : "hóspedes"}
          </span>
        </dl>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <p className="leading-none">
            <span className="text-[11px] text-ink-3">Total</span>
            <span className="ml-2 font-display text-[18px] font-medium text-ink">
              {formatPrice(total)}
            </span>
          </p>
          {canCancel(reservation.status) && (
            <CancelButton id={reservation.id_reservation} />
          )}
        </div>
      </div>
    </article>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4 text-ink-3" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 8h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
