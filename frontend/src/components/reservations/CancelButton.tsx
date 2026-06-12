"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Cancela uma reserva via DELETE /api/reservation/:id (BFF) e atualiza a
 * listagem. Pede confirmação inline antes de remover.
 */
export function CancelButton({ id }: { id: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const busy = loading || pending;

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservation/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        setError(data?.message ?? "Não foi possível cancelar.");
        setLoading(false);
        return;
      }
      setConfirming(false);
      startTransition(() => router.refresh());
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        className="h-9"
        onClick={() => setConfirming(true)}
      >
        Cancelar
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-ink-2">Confirmar?</span>
        <Button
          variant="ghost"
          className="h-9"
          disabled={busy}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
        >
          Não
        </Button>
        <Button
          className="h-9 bg-red text-white hover:bg-red/90"
          loading={busy}
          onClick={handleCancel}
        >
          Sim, cancelar
        </Button>
      </div>
      {error && <p className="text-[11px] text-red">{error}</p>}
    </div>
  );
}
