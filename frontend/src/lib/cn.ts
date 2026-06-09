import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Concatena classes condicionalmente (clsx) e resolve conflitos de
 * utilitários Tailwind (twMerge) — ex.: `px-4` sobrescrito por `px-2`
 * passado via prop className nas variantes de componentes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
