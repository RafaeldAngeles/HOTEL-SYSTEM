"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Encerra a sessão via BFF (/api/auth/logout) e volta para o login. */
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best-effort: mesmo offline, segue limpando a navegação.
    }
    router.replace("/auth/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:bg-surface hover:text-ink disabled:opacity-50 focus-visible:outline-none focus-visible:shadow-focus"
    >
      {loading ? (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
        />
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M13 14l4-4-4-4M17 10H7.5M11 4.5H5.5A1.5 1.5 0 004 6v8a1.5 1.5 0 001.5 1.5H11"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      Sair
    </button>
  );
}
