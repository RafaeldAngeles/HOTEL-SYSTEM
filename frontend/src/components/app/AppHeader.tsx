import Link from "next/link";
import type { User } from "@/types/user";
import { LogoutButton } from "./LogoutButton";

/** Iniciais do usuário para o avatar (ex.: "Rafael Angeles" → "RA"). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

/** Barra superior das telas autenticadas: marca à esquerda, usuário à direita. */
export function AppHeader({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/rooms"
          className="flex items-center gap-2.5 rounded focus-visible:outline-none focus-visible:shadow-focus"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-blue text-[14px] font-semibold text-white">
            G
          </span>
          <span className="text-[15px] font-medium tracking-[0.04em] text-ink">
            GRAND VENUE
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/rooms"
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface hover:text-ink"
            >
              Quartos
            </Link>
            <Link
              href="/reservations"
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface hover:text-ink"
            >
              Minhas reservas
            </Link>
          </nav>
          <div className="hidden items-center gap-2.5 sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-faint text-[11px] font-semibold text-blue">
              {initials(user.name)}
            </span>
            <div className="leading-tight">
              <p className="text-[12.5px] font-medium text-ink">{user.name}</p>
              <p className="text-[11px] text-ink-3">{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
