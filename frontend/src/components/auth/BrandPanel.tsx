/**
 * Painel escuro editorial compartilhado pelas telas de autenticação.
 * Camadas: gradiente diagonal + glows radiais + grid com mask + grão SVG.
 */
export function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
      {/* 1 · base: gradiente diagonal navy → #070C18 */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #070C18 100%)" }}
      />
      {/* 2 · dois glows radiais azuis */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(620px 460px at 18% 12%, rgba(37,99,235,.30), transparent 60%)," +
            "radial-gradient(560px 560px at 88% 92%, rgba(37,99,235,.16), transparent 62%)",
        }}
      />
      {/* 3 · grid 64px com mask radial pra desvanecer nas bordas */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 72% at 50% 38%, #000 28%, transparent 76%)",
          maskImage:
            "radial-gradient(ellipse 80% 72% at 50% 38%, #000 28%, transparent 76%)",
        }}
      />
      {/* 4 · grão SVG sutil por cima */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14] mix-blend-soft-light"
      >
        <filter id="gv-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#gv-grain)" />
      </svg>

      {/* marca */}
      <div className="gv-reveal relative flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-blue text-[14px] font-semibold text-white shadow-[0_6px_18px_-4px_rgba(37,99,235,.6)]">
          G
        </span>
        <span className="text-[15px] font-medium tracking-[0.04em] text-white/90">
          GRAND VENUE
        </span>
      </div>

      {/* headline */}
      <div className="relative max-w-md">
        <p
          className="gv-reveal mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.42em] text-white/45"
          style={{ animationDelay: "0.08s" }}
        >
          <span className="h-px w-7 bg-blue/70" />
          Hospitalidade de exceção
        </p>
        <h1
          className="gv-reveal font-display text-[48px] font-medium leading-[1.04] text-white"
          style={{ animationDelay: "0.16s" }}
        >
          Cada estadia,
          <br />
          <span className="italic text-[#93C5FD]">uma ocasião.</span>
        </h1>
        <p
          className="gv-reveal mt-6 max-w-sm text-[14px] leading-relaxed text-white/55"
          style={{ animationDelay: "0.24s" }}
        >
          Gerencie reservas, quartos e hóspedes em um só painel. Acesse para
          continuar.
        </p>
      </div>

      {/* features + rodapé */}
      <div
        className="gv-reveal relative flex flex-col gap-6"
        style={{ animationDelay: "0.32s" }}
      >
        <ul className="flex items-center gap-5 text-[12px] font-medium text-white/65">
          {["Reservas", "Quartos", "Hóspedes"].map((f, i) => (
            <li key={f} className="flex items-center gap-5">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-white/25" />}
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                {f}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 text-[11px] text-white/35">
          <span className="h-px w-8 bg-white/20" />© {new Date().getFullYear()}{" "}
          Grand Venue Hotel
        </div>
      </div>
    </aside>
  );
}
