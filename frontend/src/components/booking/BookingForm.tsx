"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TYPE_LABEL, formatPrice } from "@/lib/roomDisplay";
import type { Room } from "@/types/room";
import type {
  CreateReservationPayload,
  Reservation,
} from "@/types/reservation";

/** Data local de hoje no formato YYYY-MM-DD (para o atributo min dos inputs). */
function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Nº de noites entre duas datas YYYY-MM-DD (0 se inválido). */
function nightsBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(ms) || ms <= 0) return 0;
  return Math.round(ms / 86_400_000);
}

export function BookingForm({
  room,
  defaultName,
  defaultEmail,
}: {
  room: Room;
  defaultName: string;
  defaultEmail: string;
}) {
  const today = todayISO();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState(defaultName);
  const [guestEmail, setGuestEmail] = useState(defaultEmail);
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCpf, setGuestCpf] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);

  const price = Number(room.price_room);
  const nights = useMemo(
    () => nightsBetween(startDate, endDate),
    [startDate, endDate],
  );
  const total = nights * price;
  const canSubmit = nights >= 1 && guests >= 1 && !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    if (guests > room.capacity_room) {
      setError(`Este quarto comporta no máximo ${room.capacity_room} hóspedes.`);
      return;
    }
    const cpfDigits = guestCpf.replace(/\D/g, "");
    if (guestCpf && cpfDigits.length !== 11) {
      setError("CPF inválido. Informe os 11 dígitos ou deixe em branco.");
      return;
    }

    setLoading(true);

    const payload: CreateReservationPayload = {
      room_id: room.room_id,
      start_date: startDate,
      end_date: endDate,
      guests,
    };
    if (guestName.trim()) payload.guest_name = guestName.trim();
    if (guestEmail.trim()) payload.guest_email = guestEmail.trim();
    if (guestPhone.trim()) payload.guest_phone = guestPhone.trim();
    if (cpfDigits.length === 11) payload.guest_cpf = cpfDigits;
    if (notes.trim()) payload.notes = notes.trim();

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        reservation?: Reservation;
        message?: string;
      };

      if (!res.ok || !data.reservation) {
        setError(data.message ?? "Não foi possível concluir a reserva.");
        setLoading(false);
        return;
      }
      setConfirmed(data.reservation);
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <ConfirmationCard
        room={room}
        reservation={confirmed}
        nights={nights}
        total={total}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]"
      noValidate
    >
      {/* Coluna do formulário */}
      <div className="flex flex-col gap-6">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-bor bg-red-bg px-4 py-3 text-[13px] text-red"
          >
            {error}
          </div>
        )}

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-[11px] font-semibold uppercase tracking-label text-ink-3">
            Período
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Check-in"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && endDate <= e.target.value) setEndDate("");
              }}
              required
            />
            <Input
              label="Check-out"
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <Input
            label={`Hóspedes (máx. ${room.capacity_room})`}
            type="number"
            min={1}
            max={room.capacity_room}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
            required
          />
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-[11px] font-semibold uppercase tracking-label text-ink-3">
            Dados do hóspede
          </legend>
          <Input
            label="Nome"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Nome completo"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="E-mail"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="voce@email.com"
            />
            <Input
              label="Telefone"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <Input
            label="CPF (opcional)"
            value={guestCpf}
            onChange={(e) => setGuestCpf(e.target.value)}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-label text-ink-3">
              Observações
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Pedidos especiais, horário de chegada…"
              className="w-full resize-none rounded-md border border-border bg-surface px-3 py-[9px] text-[13px] text-ink outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-ink-3 focus:border-blue focus:bg-white focus:shadow-focus"
            />
          </label>
        </fieldset>
      </div>

      {/* Coluna do resumo (sticky) */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="relative aspect-[16/10] w-full bg-surface-2">
            {room.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={room.image_url}
                alt={`Quarto ${room.number_room}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{ background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)" }}
              />
            )}
          </div>

          <div className="flex flex-col gap-4 p-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-label text-ink-3">
                {TYPE_LABEL[room.type]}
              </p>
              <h2 className="mt-0.5 font-display text-[19px] font-medium text-ink">
                Quarto {room.number_room}
              </h2>
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-4 text-[13px]">
              <Row
                label={`${formatPrice(price)} × ${nights} ${nights === 1 ? "noite" : "noites"}`}
                value={nights > 0 ? formatPrice(total) : "—"}
              />
              <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[14px] font-semibold text-ink">Total</span>
                <span className="font-display text-[20px] font-medium text-ink">
                  {nights > 0 ? formatPrice(total) : "—"}
                </span>
              </div>
            </div>

            <Button type="submit" loading={loading} disabled={!canSubmit} className="mt-1 w-full">
              {loading ? "Confirmando…" : "Confirmar reserva"}
            </Button>
            {nights === 0 && (
              <p className="text-center text-[11px] text-ink-3">
                Selecione as datas para ver o total.
              </p>
            )}
          </div>
        </div>
      </aside>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-2">
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function ConfirmationCard({
  room,
  reservation,
  nights,
  total,
}: {
  room: Room;
  reservation: Reservation;
  nights: number;
  total: number;
}) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

  return (
    <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-border bg-white p-8 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-bg text-green">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 className="mt-5 font-display text-[24px] font-medium text-ink">
        Reserva confirmada!
      </h2>
      <p className="mt-1.5 text-[13px] text-ink-2">
        Reserva #{reservation.id_reservation} · Quarto {room.number_room} ·{" "}
        {TYPE_LABEL[room.type]}
      </p>

      <dl className="mt-6 flex flex-col gap-2.5 rounded-xl bg-surface px-5 py-4 text-left text-[13px]">
        <div className="flex justify-between">
          <dt className="text-ink-2">Check-in</dt>
          <dd className="font-medium text-ink">{fmt(reservation.start_date)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-2">Check-out</dt>
          <dd className="font-medium text-ink">{fmt(reservation.end_date)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-2">Hóspedes</dt>
          <dd className="font-medium text-ink">{reservation.guests}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2.5">
          <dt className="text-ink-2">
            Total ({nights} {nights === 1 ? "noite" : "noites"})
          </dt>
          <dd className="font-display text-[16px] font-medium text-ink">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-col gap-2.5">
        <Link
          href="/reservations"
          className="inline-flex h-11 items-center justify-center rounded-md bg-blue px-6 text-[13px] font-medium text-white transition-colors hover:bg-blue-dark"
        >
          Ver minhas reservas
        </Link>
        <Link
          href="/rooms"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface"
        >
          Voltar aos quartos
        </Link>
      </div>
    </div>
  );
}
