"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";

/** Classe base dos inputs: 50px de altura, radius 11px, ring de foco 4px. */
export const inputClass =
  "h-[50px] w-full rounded-[11px] border border-border bg-surface px-3.5 text-[14px] text-ink " +
  "placeholder:text-ink-3 outline-none transition-[border-color,background-color,box-shadow] duration-150 " +
  "focus:border-blue focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,.12)]";

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-label text-ink-3">
        {label}
      </span>
      <div className="relative">{children}</div>
    </label>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function TextField({ label, className, ...props }: TextFieldProps) {
  return (
    <FieldLabel label={label}>
      <input className={`${inputClass} ${className ?? ""}`} {...props} />
    </FieldLabel>
  );
}

/** Campo de senha com toggle de visibilidade. */
export function PasswordField({ label, ...props }: TextFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <FieldLabel label={label}>
      <input
        type={show ? "text" : "password"}
        className={`${inputClass} pr-12`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-2.5 my-auto grid h-8 w-8 place-items-center rounded-md text-ink-3 transition-colors hover:text-ink-2 focus-visible:text-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </FieldLabel>
  );
}

export function AuthAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 rounded-[11px] border border-red-bor bg-red-bg px-3.5 py-3 text-[12px] text-red"
    >
      <svg
        className="mt-px h-4 w-4 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
}: {
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group mt-1 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[11px] text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,.6)] transition-all duration-200 hover:shadow-[0_14px_30px_-8px_rgba(37,99,235,.7)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
      style={{ background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" }}
    >
      {loading && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {children}
    </button>
  );
}

function EyeIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M2.5 10S5 4.5 10 4.5 17.5 10 17.5 10 15 15.5 10 15.5 2.5 10 2.5 10Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7.5 5.1A7.6 7.6 0 0110 4.5c5 0 7.5 5.5 7.5 5.5a13 13 0 01-2.2 2.9M5 6.5A12.8 12.8 0 002.5 10S5 15.5 10 15.5c1 0 1.9-.2 2.7-.5M3 3l14 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
