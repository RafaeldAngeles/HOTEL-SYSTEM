import type { UserRole } from "@/types/user";

/**
 * Payload do access token emitido pelo backend (auth.service.ts → signAccess).
 * exp/iat são adicionados pelo @nestjs/jwt.
 */
export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: UserRole;
  jti: string;
  exp: number;
  iat: number;
}

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  // atob existe no runtime Edge (middleware) e no Node 18+.
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Decodifica o payload do JWT SEM verificar a assinatura.
 * Uso exclusivo para decisões de roteamento/UX no middleware — a
 * autorização real continua sendo enforçada pelo backend em cada request.
 */
export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as AccessTokenPayload;
  } catch {
    return null;
  }
}

/** true se o token está expirado (com folga de `skewSeconds`). */
export function isExpired(payload: AccessTokenPayload, skewSeconds = 10): boolean {
  if (!payload.exp) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSec + skewSeconds;
}
