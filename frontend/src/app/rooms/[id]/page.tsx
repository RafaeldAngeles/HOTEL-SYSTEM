import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getRoom } from "@/lib/rooms";
import { STATUS, TYPE_LABEL, formatPrice } from "@/lib/roomDisplay";
import { AppHeader } from "@/components/app/AppHeader";
import type { RoomType } from "@/types/room";

export const dynamic = "force-dynamic";

/** Comodidades exibidas por tipo de quarto (estático, ilustrativo). */
const AMENITIES: Record<RoomType, string[]> = {
  single: ["Wi-Fi gratuito", "Ar-condicionado", "TV a cabo", "Banheiro privativo"],
  double: ["Wi-Fi gratuito", "Ar-condicionado", "TV a cabo", "Frigobar", "Cama de casal"],
  suite: [
    "Wi-Fi gratuito",
    "Ar-condicionado",
    "Smart TV",
    "Frigobar",
    "Banheira de hidromassagem",
    "Varanda com vista",
  ],
};

export default async function RoomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const room = await getRoom(Number(params.id));
  if (!room) notFound();

  const status = STATUS[room.status];
  const available = room.status === "available";

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader user={user} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:text-blue"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Voltar para os quartos
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          {/* Foto */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-2">
            {room.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={room.image_url}
                alt={`Foto do quarto ${room.number_room}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-3"
                style={{ background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)" }}
              >
                <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[12px] font-medium uppercase tracking-label">
                  Sem foto
                </span>
              </div>
            )}
            <span
              className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          {/* Informações */}
          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue">
              {TYPE_LABEL[room.type]}
            </p>
            <h1 className="mt-1.5 font-display text-[34px] font-medium leading-tight text-ink">
              Quarto {room.number_room}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-2">
              <span className="inline-flex items-center gap-1.5">
                <GuestIcon />
                {room.capacity_room}{" "}
                {room.capacity_room === 1 ? "hóspede" : "hóspedes"}
              </span>
              {room.floor != null && (
                <span className="inline-flex items-center gap-1.5">
                  <FloorIcon />
                  {room.floor}º andar
                </span>
              )}
            </div>

            <p className="mt-5 text-[14px] leading-relaxed text-ink-2">
              {room.description_room}
            </p>

            <h2 className="mt-7 text-[11px] font-semibold uppercase tracking-label text-ink-3">
              Comodidades
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-ink">
              {AMENITIES[room.type].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            {/* Preço + CTA */}
            <div className="mt-8 flex items-end justify-between border-t border-border pt-5">
              <p className="leading-none">
                <span className="font-display text-[26px] font-medium text-ink">
                  {formatPrice(room.price_room)}
                </span>
                <span className="ml-1.5 text-[13px] text-ink-3">/ noite</span>
              </p>

              {available ? (
                <Link
                  href={`/booking/${room.room_id}`}
                  className="inline-flex items-center justify-center rounded-md bg-blue px-6 py-2.5 text-[13px] font-medium leading-none text-white transition-colors hover:bg-blue-dark focus-visible:outline-none focus-visible:shadow-focus"
                >
                  Reservar
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-md border border-border px-6 py-2.5 text-[13px] font-medium leading-none text-ink-3">
                  Indisponível
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
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

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-blue" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 10.5l3.5 3.5L16 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
