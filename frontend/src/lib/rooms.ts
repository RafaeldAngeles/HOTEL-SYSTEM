import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import type { PaginatedResult, Room } from "@/types/room";

/**
 * Lista os quartos via GET /room (rota pública e paginada no backend).
 * Uso server-side: lê o access token do cookie para acompanhar a sessão.
 * Em falha de conexão devolve uma lista vazia — a página trata o estado.
 */
export async function getRooms(
  page = 1,
  limit = 24,
): Promise<PaginatedResult<Room>> {
  const token = getAccessToken();
  const res = await apiFetch<PaginatedResult<Room>>(
    `/room?page=${page}&limit=${limit}`,
    { token },
  );

  if (!res.ok) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }
  return res.data;
}

/**
 * Busca um quarto por id via GET /room/:id (rota pública).
 * Devolve null se o id for inválido, o quarto não existir ou a conexão falhar
 * — a página trata como 404.
 */
export async function getRoom(id: number): Promise<Room | null> {
  if (!Number.isInteger(id) || id < 1) return null;

  const token = getAccessToken();
  const res = await apiFetch<Room | null>(`/room/${id}`, { token });

  if (!res.ok || !res.data) return null;
  return res.data;
}
