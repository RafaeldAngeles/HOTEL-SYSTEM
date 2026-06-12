import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { decodeAccessToken, isExpired, type AccessTokenPayload } from "@/lib/jwt";

const ACCESS_COOKIE = "gv_access";
const REFRESH_COOKIE = "gv_refresh";

// Rotas de autenticação: usuário JÁ logado não deve vê-las.
const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Áreas que exigem login (backend exige JWT nelas).
const PROTECTED_PREFIXES = ["/admin", "/account", "/booking", "/reservations"];

// Subconjunto restrito a administradores.
const ADMIN_PREFIX = "/admin";

const ACCESS_MAX_AGE = 60 * 15;

function homeFor(role: string | undefined) {
  return role === "admin" ? "/admin" : "/rooms";
}

/** Tenta renovar o access token via backend usando o refresh token. */
async function tryRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; payload: AccessTokenPayload } | null> {
  try {
    const res = await fetch(`${env.backendUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) return null;
    const payload = decodeAccessToken(data.access_token);
    if (!payload) return null;
    return { accessToken: data.access_token, payload };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  let payload = accessToken ? decodeAccessToken(accessToken) : null;
  let valid = payload != null && !isExpired(payload);

  // Cookie a ser gravado na resposta caso o token seja renovado.
  let refreshedAccess: string | null = null;

  // Access expirado/ausente mas com refresh válido → tenta renovar.
  if (!valid && refreshToken) {
    const refreshed = await tryRefresh(refreshToken);
    if (refreshed) {
      payload = refreshed.payload;
      valid = true;
      refreshedAccess = refreshed.accessToken;
    }
  }

  const role = payload?.role;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);

  // Helper para aplicar o cookie renovado em qualquer resposta.
  const withRefreshed = (res: NextResponse) => {
    if (refreshedAccess) {
      res.cookies.set(ACCESS_COOKIE, refreshedAccess, {
        httpOnly: true,
        secure: env.isProd,
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_MAX_AGE,
      });
    }
    return res;
  };

  // 1. Logado tentando acessar /auth/* → manda pra home do papel.
  if (isAuthRoute && valid) {
    return withRefreshed(
      NextResponse.redirect(new URL(homeFor(role), req.url)),
    );
  }

  // 2. Rota protegida sem sessão válida → login (guardando o destino).
  if (isProtected && !valid) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    const res = NextResponse.redirect(loginUrl);
    // Sessão inválida: limpa cookies remanescentes.
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  // 3. Rota de admin com papel != admin → fora.
  if (isAdminRoute && valid && role !== "admin") {
    return withRefreshed(NextResponse.redirect(new URL("/rooms", req.url)));
  }

  return withRefreshed(NextResponse.next());
}

export const config = {
  // Roda em tudo, menos assets estáticos e os route handlers (BFF, que
  // gerenciam os próprios cookies).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
