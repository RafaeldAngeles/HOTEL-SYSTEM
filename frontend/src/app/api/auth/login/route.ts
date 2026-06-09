import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { setSessionCookies } from "@/lib/session";
import type { AuthTokens, User } from "@/types/user";

/**
 * BFF: o navegador chama esta rota; ela fala com o NestJS, guarda os
 * tokens em cookies httpOnly e devolve apenas os dados do usuário.
 */
export async function POST(request: Request) {
  let payload: { email?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const { email, password } = payload;
  if (!email || !password) {
    return NextResponse.json(
      { message: "Informe e-mail e senha." },
      { status: 400 },
    );
  }

  const login = await apiFetch<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!login.ok) {
    return NextResponse.json(
      { message: login.error.message },
      { status: login.status },
    );
  }

  setSessionCookies(login.data.access_token, login.data.refresh_token);

  // Busca o perfil para o front decidir o redirect (admin vs guest).
  const me = await apiFetch<User>("/auth/me", {
    token: login.data.access_token,
  });

  return NextResponse.json(
    { user: me.ok ? me.data : null },
    { status: 200 },
  );
}
