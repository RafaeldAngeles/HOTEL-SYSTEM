import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import type { PaginatedResult } from "@/types/room";
import type { ReservationWithRoom } from "@/types/reservation";

/**
 * Lista as reservas do usuário logado via GET /reservation/my (paginado).
 * Uso server-side: lê o access token do cookie httpOnly.
 * Em falha de conexão devolve uma lista vazia — a página trata o estado.
 */
export async function getMyReservations(
  page = 1,
  limit = 24,
): Promise<PaginatedResult<ReservationWithRoom>> {
  const token = getAccessToken();
  const res = await apiFetch<PaginatedResult<ReservationWithRoom>>(
    `/reservation/my?page=${page}&limit=${limit}`,
    { token },
  );

  if (!res.ok) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }
  return res.data;
}
