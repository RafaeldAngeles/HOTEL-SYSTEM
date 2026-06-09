"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  AuthAlert,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/form";
import type { User } from "@/types/user";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <AuthShell
      title="Bem-vindo de volta"
      subtitle="Entre com suas credenciais para acessar o sistema."
      footer={
        <>
          Não tem uma conta?{" "}
          <Link
            href="/auth/register"
            className="rounded font-semibold text-blue transition-colors hover:text-blue-dark focus-visible:outline-none focus-visible:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
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
          <PasswordField
            label="Senha"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="rounded text-[11px] text-ink-2 transition-colors hover:text-blue focus-visible:text-blue focus-visible:outline-none"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        <SubmitButton loading={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
