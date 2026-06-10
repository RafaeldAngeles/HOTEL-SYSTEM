import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getRoom } from "@/lib/rooms";
import { AppHeader } from "@/components/app/AppHeader";
import { BookingForm } from "@/components/booking/BookingForm";
import { TYPE_LABEL } from "@/lib/roomDisplay";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const room = await getRoom(Number(params.id));
  if (!room) notFound();

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader user={user} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href={`/rooms/${room.room_id}`}
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
          Voltar para o quarto
        </Link>

        <header className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue">
            {TYPE_LABEL[room.type]} · Quarto {room.number_room}
          </p>
          <h1 className="mt-1.5 font-display text-[30px] font-medium text-ink">
            Finalizar reserva
          </h1>
        </header>

        {room.status === "available" ? (
          <BookingForm
            room={room}
            defaultName={user.name}
            defaultEmail={user.email}
          />
        ) : (
          <div className="mt-8 rounded-xl border border-amber-bor bg-amber-bg px-5 py-6 text-[14px] text-ink">
            Este quarto não está disponível para reserva no momento.{" "}
            <Link href="/rooms" className="font-semibold text-blue hover:text-blue-dark">
              Ver outros quartos
            </Link>
            .
          </div>
        )}
      </main>
    </div>
  );
}
