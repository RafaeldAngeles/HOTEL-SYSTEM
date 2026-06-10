import type { RoomStatus, RoomType } from "@/types/room";

/** Rótulos e formatação de apresentação dos quartos (card e detalhe). */

export const TYPE_LABEL: Record<RoomType, string> = {
  single: "Individual",
  double: "Casal",
  suite: "Suíte",
};

export const STATUS: Record<RoomStatus, { label: string; className: string }> = {
  available: { label: "Disponível", className: "bg-green-bg text-green border-green-bor" },
  occupied: { label: "Ocupado", className: "bg-red-bg text-red border-red-bor" },
  cleaning: { label: "Limpeza", className: "bg-amber-bg text-amber border-amber-bor" },
  maintenance: { label: "Manutenção", className: "bg-surface-2 text-ink-2 border-border-2" },
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPrice(value: string | number): string {
  return brl.format(Number(value));
}
