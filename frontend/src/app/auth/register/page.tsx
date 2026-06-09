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

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Validação client-side espelhando os DTOs do backend. */
  function validate(): string | null {
    if (name.trim().length < 2) return "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido.";
    if (password.length < 8) return "A senha deve ter ao menos 8 caracteres.";
    if (password !== confirm) return "As senhas não coincidem.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });

      const data = (await res.json()) as {
        user?: User | null;
        autoLogin?: boolean;
        message?: string;
      };

      if (!res.ok) {
        setError(data.message ?? "Não foi possível criar a conta.");
        setLoading(false);
        return;
      }

      // Conta criada mas auto-login falhou → manda pro login.
      if (data.autoLogin === false) {
        router.replace("/auth/login");
        return;
      }

      const home = data.user?.role === "admin" ? "/admin" : "/rooms";
      router.replace(home);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Crie sua conta"
      subtitle="Leva menos de um minuto para começar."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link
            href="/auth/login"
            className="rounded font-semibold text-blue transition-colors hover:text-blue-dark focus-visible:outline-none focus-visible:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Nome completo"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="João Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <PasswordField
          label="Senha"
          name="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <PasswordField
          label="Confirmar senha"
          name="confirm"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <SubmitButton loading={loading}>
          {loading ? "Criando conta…" : "Criar conta"}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
