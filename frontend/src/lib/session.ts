import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@/types/user";
import { apiFetch } from "@/lib/api";
import { env } from "@/lib/env";

export const ACCESS_COOKIE = "gv_access";
export const REFRESH_COOKIE = "gv_refresh";

// JWT_EXPIRES=15m · JWT_REFRESH_EXPIRES=7d (default do backend)
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

/** Grava os tokens como cookies httpOnly (inacessíveis ao JS do cliente). */
export function setSessionCookies(accessToken: string, refreshToken: string) {
  const store = cookies();
  const base = {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax" as const,
    path: "/",
  };
  store.set(ACCESS_COOKIE, accessToken, { ...base, maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_COOKIE, refreshToken, { ...base, maxAge: REFRESH_MAX_AGE });
}

export function clearSessionCookies() {
  const store = cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export function getAccessToken(): string | undefined {
  return cookies().get(ACCESS_COOKIE)?.value;
}

export function getRefreshToken(): string | undefined {
  return cookies().get(REFRESH_COOKIE)?.value;
}

/**
 * Busca o usuário logado em GET /auth/me usando o access token do cookie.
 * Envolto em React cache(): múltiplos Server Components no mesmo request
 * compartilham uma única chamada ao backend.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = getAccessToken();
  if (!token) return null;

  const res = await apiFetch<User>("/auth/me", { token });
  return res.ok ? res.data : null;
});
