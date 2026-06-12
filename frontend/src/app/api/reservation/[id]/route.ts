import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

/**
 * BFF de cancelamento: encaminha DELETE /reservation/:id ao backend com o
 * access token do cookie httpOnly. O backend garante que o hóspede só remove
 * as próprias reservas (findById amarra ao req.user).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const token = getAccessToken();
  if (!token) {
    return NextResponse.json(
      { message: "Sessão expirada. Entre novamente." },
      { status: 401 },
    );
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "Reserva inválida." }, { status: 400 });
  }

  const res = await apiFetch(`/reservation/${id}`, {
    method: "DELETE",
    token,
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: res.error.message },
      { status: res.status },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
