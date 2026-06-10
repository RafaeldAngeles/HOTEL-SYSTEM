import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import type { CreateReservationPayload, Reservation } from "@/types/reservation";

/**
 * BFF de reserva: encaminha POST /reservation ao backend com o access token
 * do cookie httpOnly. O backend amarra a reserva ao usuário logado (req.user).
 */
export async function POST(request: Request) {
  const token = getAccessToken();
  if (!token) {
    return NextResponse.json(
      { message: "Sessão expirada. Entre novamente." },
      { status: 401 },
    );
  }

  let payload: CreateReservationPayload;
  try {
    payload = (await request.json()) as CreateReservationPayload;
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const res = await apiFetch<Reservation>("/reservation", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: res.error.message },
      { status: res.status },
    );
  }

  return NextResponse.json({ reservation: res.data }, { status: 201 });
}
