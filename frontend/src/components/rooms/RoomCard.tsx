import Link from "next/link";
import type { Room, RoomType } from "@/types/room";
import { STATUS, TYPE_LABEL, formatPrice } from "@/lib/roomDisplay";

export function RoomCard({ room }: { room: Room }) {
  const status = STATUS[room.status];

  return (
    <Link
      href={`/rooms/${room.room_id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow duration-150 hover:shadow-card-hover focus-visible:outline-none focus-visible:shadow-focus"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
        {room.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.image_url}
            alt={`Foto do quarto ${room.number_room}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <RoomPlaceholder type={room.type} />
        )}
        <span
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10.5px] font-medium backdrop-blur ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold uppercase tracking-label text-ink-3">
          {TYPE_LABEL[room.type]}
        </p>
        <h3 className="mt-1 font-display text-[22px] font-medium text-ink">
          Quarto {room.number_room}
        </h3>

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
          {room.description_room}
        </p>

        <dl className="mt-4 flex items-center gap-5 text-[12px] text-ink-2">
          <div className="flex items-center gap-1.5">
            <GuestIcon />
            <span>
              {room.capacity_room}{" "}
              {room.capacity_room === 1 ? "hóspede" : "hóspedes"}
            </span>
          </div>
          {room.floor != null && (
            <div className="flex items-center gap-1.5">
              <FloorIcon />
              <span>{room.floor}º andar</span>
            </div>
          )}
        </dl>

        <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
          <p className="leading-none">
            <span className="font-display text-[20px] font-medium text-ink">
              {formatPrice(room.price_room)}
            </span>
            <span className="ml-1 text-[12px] text-ink-3">/ noite</span>
          </p>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue transition-colors group-hover:text-blue-dark">
            Ver detalhes
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Placeholder quando o quarto ainda não tem foto cadastrada. */
function RoomPlaceholder({ type }: { type: RoomType }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-3"
      style={{ background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)" }}
    >
      <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[11px] font-medium uppercase tracking-label">
        {TYPE_LABEL[type]}
      </span>
    </div>
  );
}

function GuestIcon() {
  return (
    <svg className="h-4 w-4 text-ink-3" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 16.5c0-2.8 2.7-5 6-5s6 2.2 6 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FloorIcon() {
  return (
    <svg className="h-4 w-4 text-ink-3" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 17h14M5 17V8l5-3.5L15 8v9M8.5 17v-4h3v4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
