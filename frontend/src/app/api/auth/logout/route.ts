import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import {
  clearSessionCookies,
  getAccessToken,
  getRefreshToken,
} from "@/lib/session";

/** Invalida a sessão: revoga no backend (best-effort) e limpa os cookies. */
export async function POST() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken) {
    await apiFetch("/auth/logout", {
      method: "POST",
      token: accessToken,
      body: JSON.stringify({ refresh_token: refreshToken ?? "" }),
    });
  }

  clearSessionCookies();
  return NextResponse.json({ ok: true });
}
