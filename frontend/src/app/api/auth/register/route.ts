import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { setSessionCookies } from "@/lib/session";
import type { AuthTokens, User } from "@/types/user";

/**
 * BFF de cadastro: cria o usuário em POST /user/cadastro e, em seguida,
 * faz login automático (POST /auth/login) gravando os cookies httpOnly —
 * o usuário já entra logado.
 */
export async function POST(request: Request) {
  let payload: { name?: string; email?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const name = payload.name?.trim();
  const { email, password } = payload;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Preencha nome, e-mail e senha." },
      { status: 400 },
    );
  }

  const created = await apiFetch<User>("/user/cadastro", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  if (!created.ok) {
    return NextResponse.json(
      { message: created.error.message },
      { status: created.status },
    );
  }

  // Login automático com as credenciais recém-criadas.
  const login = await apiFetch<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!login.ok) {
    // Conta criada, mas o auto-login falhou: o cliente cai no login manual.
    return NextResponse.json(
      { user: created.data, autoLogin: false },
      { status: 201 },
    );
  }

  setSessionCookies(login.data.access_token, login.data.refresh_token);

  return NextResponse.json(
    { user: created.data, autoLogin: true },
    { status: 201 },
  );
}
