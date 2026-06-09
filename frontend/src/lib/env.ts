/**
 * Configuração de ambiente centralizada e tipada.
 * Único ponto que lê process.env — evita strings mágicas espalhadas.
 */
export const env = {
  /** URL do backend NestJS (uso server-side / middleware). */
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:3000",
  isProd: process.env.NODE_ENV === "production",
} as const;
