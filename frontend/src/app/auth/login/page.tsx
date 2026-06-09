"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { User } from "@/types/user";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { user?: User | null; message?: string };

      if (!res.ok) {
        setError(data.message ?? "Não foi possível entrar.");
        setLoading(false);
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      const home = data.user?.role === "admin" ? "/admin" : "/rooms";
      // Só aceita destinos internos (evita open redirect).
      const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : home;
      router.replace(dest);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ── Painel de marca (editorial / luxo) ───────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-14">
        {/* atmosfera: brilho radial + grade sutil */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 15% 0%, rgba(37,99,235,.22), transparent 55%), radial-gradient(80% 60% at 100% 100%, rgba(37,99,235,.10), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-blue text-[13px] font-semibold text-white">
            G
          </span>
          <span className="text-[15px] font-medium tracking-wide text-white/90">
            GRAND VENUE
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.22em] text-blue-faint/80">
            <span className="text-white/40">Hospitalidade</span>
          </p>
          <h1 className="font-display text-[44px] font-medium italic leading-[1.05] text-white">
            Cada estadia,
            <br />
            uma ocasião.
          </h1>
          <p className="mt-6 text-[13px] leading-relaxed text-white/55">
            Gerencie reservas, quartos e hóspedes em um só lugar. Acesse o
            painel para continuar.
          </p>
        </div>

        <div className="relative flex items-center gap-3 text-[11px] text-white/35">
          <span className="h-px w-8 bg-white/20" />
          © {new Date().getFullYear()} Grand Venue Hotel
        </div>
      </aside>

      {/* ── Formulário ───────────────────────────────────────────────── */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[380px]">
          {/* marca no mobile */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-blue text-[13px] font-semibold text-white">
              G
            </span>
            <span className="text-[15px] font-medium text-ink">GRAND VENUE</span>
          </div>

          <header className="mb-8">
            <h2 className="text-[20px] font-medium text-ink">Bem-vindo de volta</h2>
            <p className="mt-1.5 text-[13px] text-ink-2">
              Entre com suas credenciais para acessar o sistema.
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-md border border-red-bor bg-red-bg px-3 py-2.5 text-[12px] text-red"
            >
              <svg
                className="mt-px h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="E-mail"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="voce@grandvenue.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="rounded p-1 text-ink-3 transition-colors hover:text-ink-2 focus:outline-none focus-visible:text-blue"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] text-ink-2 transition-colors hover:text-blue"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <Button type="submit" loading={loading} className="mt-1 w-full">
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="mt-7 text-center text-[12px] text-ink-2">
            Não tem uma conta?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-blue transition-colors hover:text-blue-dark"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M2.5 10S5 4.5 10 4.5 17.5 10 17.5 10 15 15.5 10 15.5 2.5 10 2.5 10Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7.5 5.1A7.6 7.6 0 0110 4.5c5 0 7.5 5.5 7.5 5.5a13 13 0 01-2.2 2.9M5 6.5A12.8 12.8 0 002.5 10S5 15.5 10 15.5c1 0 1.9-.2 2.7-.5M3 3l14 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
