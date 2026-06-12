import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyReservations } from "@/lib/reservations";
import { AppHeader } from "@/components/app/AppHeader";
import { ReservationCard } from "@/components/reservations/ReservationCard";

export const metadata = {
  title: "Minhas reservas — Grand Venue",
};

// Sempre renderiza no request (depende de cookies/sessão).
export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { data: reservations, total } = await getMyReservations();

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader user={user} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <section className="gv-reveal">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue">
            Grand Venue
          </p>
          <h1 className="mt-2 font-display text-[32px] font-medium text-ink">
            Minhas reservas
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-2">
            Acompanhe e gerencie suas estadias.
          </p>
        </section>

        {reservations.length > 0 ? (
          <>
            <p className="mt-8 text-[12px] text-ink-3">
              {total} {total === 1 ? "reserva" : "reservas"}
            </p>
            <div className="mt-4 flex flex-col gap-4">
              {reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id_reservation}
                  reservation={reservation}
                />
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
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <h2 className="mt-4 text-[15px] font-medium text-ink">
        Você ainda não tem reservas
      </h2>
      <p className="mt-1.5 max-w-xs text-[13px] text-ink-2">
        Escolha um quarto e reserve sua próxima estadia — ela aparecerá aqui.
      </p>
      <Link
        href="/rooms"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-blue px-6 text-[13px] font-medium text-white transition-colors hover:bg-blue-dark"
      >
        Ver quartos
      </Link>
    </div>
  );
}
