import type { ReactNode } from "react";
import { BrandPanel } from "./BrandPanel";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Casca das telas de autenticação: split 50/50 com o painel de marca à
 * esquerda e a coluna de formulário à direita (empilha no mobile).
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-[384px]">
          {/* marca no mobile */}
          <div
            className="gv-reveal mb-10 flex items-center gap-2.5 lg:hidden"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-blue text-[14px] font-semibold text-white">
              G
            </span>
            <span className="text-[15px] font-medium text-ink">GRAND VENUE</span>
          </div>

          <header className="gv-reveal mb-8" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-display text-[26px] font-medium text-ink">{title}</h2>
            <p className="mt-1.5 text-[13px] text-ink-2">{subtitle}</p>
          </header>

          <div className="gv-reveal" style={{ animationDelay: "0.18s" }}>
            {children}
          </div>

          {footer && (
            <div
              className="gv-reveal mt-7 text-center text-[12px] text-ink-2"
              style={{ animationDelay: "0.26s" }}
            >
              {footer}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
