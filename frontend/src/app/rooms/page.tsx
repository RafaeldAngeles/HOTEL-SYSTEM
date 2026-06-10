import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getRooms } from "@/lib/rooms";
import { AppHeader } from "@/components/app/AppHeader";
import { RoomCard } from "@/components/rooms/RoomCard";

export const metadata = {
  title: "Quartos — Grand Venue",
};

// Sempre renderiza no request (depende de cookies/sessão).
export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { data: rooms, total } = await getRooms();
  const firstName = user.name.trim().split(/\s+/)[0];

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader user={user} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="gv-reveal">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue">
            Grand Venue
          </p>
          <h1 className="mt-2 font-display text-[32px] font-medium text-ink">
            Olá, {firstName}.
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-2">
            Escolha entre nossos quartos e reserve sua próxima estadia.
          </p>
        </section>

        {rooms.length > 0 ? (
          <>
            <p className="mt-8 text-[12px] text-ink-3">
              {total} {total === 1 ? "quarto encontrado" : "quartos encontrados"}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room.room_id} room={room} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-20 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-ink-3">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 className="mt-4 text-[15px] font-medium text-ink">
        Nenhum quarto disponível
      </h2>
      <p className="mt-1.5 max-w-xs text-[13px] text-ink-2">
        Ainda não há quartos cadastrados ou o servidor não respondeu. Tente
        novamente em instantes.
      </p>
    </div>
  );
}
