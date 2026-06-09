/**
 * Cliente HTTP para o backend NestJS.
 *
 * Usado SOMENTE no servidor (route handlers / server components).
 * Mantém o segredo dos tokens fora do bundle do cliente — o navegador
 * fala apenas com os route handlers do Next (BFF), que guardam os JWTs
 * em cookies httpOnly.
 */
import { env } from "@/lib/env";

const BACKEND_URL = env.backendUrl;

export interface ApiError {
  status: number;
  message: string;
}

type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: ApiError };

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<ApiResult<T>> {
  const { token, headers, ...rest } = init ?? {};

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 503,
      error: { status: 503, message: "Não foi possível conectar ao servidor." },
    };
  }

  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: {
        status: res.status,
        message: extractMessage(body) ?? "Erro inesperado.",
      },
    };
  }

  return { ok: true, status: res.status, data: body as T };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  return normalizeMessage((body as Record<string, unknown>).message);
}

/**
 * Extrai a mensagem do erro. O AllExceptionsFilter do backend aninha:
 *   { message: { message: string | string[], error, statusCode } }
 * e validações vêm como array. Trata todos os formatos recursivamente.
 */
function normalizeMessage(m: unknown): string | null {
  if (typeof m === "string") return m;
  if (Array.isArray(m)) return m.length ? String(m[0]) : null;
  if (m && typeof m === "object") {
    return normalizeMessage((m as Record<string, unknown>).message);
  }
  return null;
}
