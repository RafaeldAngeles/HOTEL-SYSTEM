export type UserRole = "admin" | "guest";

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
}

/** Resposta de POST /auth/login no backend NestJS */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}
