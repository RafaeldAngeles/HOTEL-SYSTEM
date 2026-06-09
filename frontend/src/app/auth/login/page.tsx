"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      const dest =
        next && next.startsWith("/") && !next.startsWith("//") ? next : home;
      router.replace(dest);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* ══ Lado escuro — atmosfera editorial ════════════════════════ */}
      <aside className="relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        {/* 1 · base: gradiente diagonal navy → #070C18 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #070C18 100%)",
          }}
        />
        {/* 2 · dois glows radiais azuis */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(620px 460px at 18% 12%, rgba(37,99,235,.30), transparent 60%)," +
              "radial-gradient(560px 560px at 88% 92%, rgba(37,99,235,.16), transparent 62%)",
          }}
        />
        {/* 3 · grid 64px com mask radial pra desvanecer nas bordas */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px)," +
              "linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 72% at 50% 38%, #000 28%, transparent 76%)",
            maskImage:
              "radial-gradient(ellipse 80% 72% at 50% 38%, #000 28%, transparent 76%)",
          }}
        />
        {/* 4 · grão SVG sutil por cima */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14] mix-blend-soft-light"
        >
          <filter id="gv-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves={2}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#gv-grain)" />
        </svg>

        {/* marca */}
        <div className="gv-reveal relative flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-blue text-[14px] font-semibold text-white shadow-[0_6px_18px_-4px_rgba(37,99,235,.6)]">
            G
          </span>
          <span className="text-[15px] font-medium tracking-[0.04em] text-white/90">
            GRAND VENUE
          </span>
        </div>

        {/* headline */}
        <div className="relative max-w-md">
          <p
            className="gv-reveal mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.42em] text-white/45"
            style={{ animationDelay: "0.08s" }}
          >
            <span className="h-px w-7 bg-blue/70" />
            Hospitalidade de exceção
          </p>
          <h1
            className="gv-reveal font-display text-[48px] font-medium leading-[1.04] text-white"
            style={{ animationDelay: "0.16s" }}
          >
            Cada estadia,
            <br />
            <span className="italic text-[#93C5FD]">uma ocasião.</span>
          </h1>
          <p
            className="gv-reveal mt-6 max-w-sm text-[14px] leading-relaxed text-white/55"
            style={{ animationDelay: "0.24s" }}
          >
            Gerencie reservas, quartos e hóspedes em um só painel. Acesse para
            continuar.
          </p>
        </div>

        {/* features + rodapé */}
        <div
          className="gv-reveal relative flex flex-col gap-6"
          style={{ animationDelay: "0.32s" }}
        >
          <ul className="flex items-center gap-5 text-[12px] font-medium text-white/65">
            {["Reservas", "Quartos", "Hóspedes"].map((f, i) => (
              <li key={f} className="flex items-center gap-5">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-white/25" />}
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                  {f}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 text-[11px] text-white/35">
            <span className="h-px w-8 bg-white/20" />©{" "}
            {new Date().getFullYear()} Grand Venue Hotel
          </div>
        </div>
      </aside>

      {/* ══ Lado claro — formulário ══════════════════════════════════ */}
      <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-[384px]">
          {/* marca no mobile */}
          <div
            className="gv-reveal mb-10 flex items-center gap-2.5 lg:hidden"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-blue text-[14px] font-semibold text-white">
              G
            </span>
            <span className="text-[15px] font-medium text-ink">GRAND VENUE</span>
          </div>

          <header className="gv-reveal mb-8" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-display text-[26px] font-medium text-ink">
              Bem-vindo de volta
            </h2>
            <p className="mt-1.5 text-[13px] text-ink-2">
              Entre com suas credenciais para acessar o sistema.
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="gv-reveal mb-5 flex items-start gap-2.5 rounded-[11px] border border-red-bor bg-red-bg px-3.5 py-3 text-[12px] text-red"
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

          <form
            onSubmit={handleSubmit}
            className="gv-reveal flex flex-col gap-4"
            style={{ animationDelay: "0.18s" }}
            noValidate
          >
            <Field label="E-mail">
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="voce@grandvenue.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <div className="flex flex-col gap-1.5">
              <Field label="Senha">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2.5 my-auto grid h-8 w-8 place-items-center rounded-md text-ink-3 transition-colors hover:text-ink-2 focus-visible:text-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </Field>
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="rounded text-[11px] text-ink-2 transition-colors hover:text-blue focus-visible:text-blue focus-visible:outline-none"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-1 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[11px] text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,.6)] transition-all duration-200 hover:shadow-[0_14px_30px_-8px_rgba(37,99,235,.7)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              }}
            >
              {loading && (
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p
            className="gv-reveal mt-7 text-center text-[12px] text-ink-2"
            style={{ animationDelay: "0.26s" }}
          >
            Não tem uma conta?{" "}
            <Link
              href="/auth/register"
              className="rounded font-semibold text-blue transition-colors hover:text-blue-dark focus-visible:outline-none focus-visible:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

/* Classe base dos inputs: 50px de altura, radius 11px, ring de foco 4px. */
const inputClass =
  "h-[50px] w-full rounded-[11px] border border-border bg-surface px-3.5 text-[14px] text-ink " +
  "placeholder:text-ink-3 outline-none transition-[border-color,background-color,box-shadow] duration-150 " +
  "focus:border-blue focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,.12)]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-label text-ink-3">
        {label}
      </span>
      <div className="relative">{children}</div>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="none" aria-hidden>
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
    <svg className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="none" aria-hidden>
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
