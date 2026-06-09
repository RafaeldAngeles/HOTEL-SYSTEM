import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Slot à direita do input (ex.: botão mostrar/ocultar senha). */
  trailing?: ReactNode;
}

/**
 * Design system · Input
 * bg #F8FAFC · border 1px #E2E8F0 · radius 8px · padding 9px 12px · 13px/#0F172A
 * focus: border #2563EB, bg white, ring 3px blue-faint
 * label: 10px uppercase, tracking .06em, #94A3B8
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, trailing, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] font-medium uppercase tracking-label text-ink-3"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "w-full rounded-md bg-surface text-[13px] text-ink",
              "border border-border px-3 py-[9px]",
              "placeholder:text-ink-3 outline-none",
              "transition-[border-color,background-color,box-shadow] duration-150",
              "focus:border-blue focus:bg-white focus:shadow-focus",
              error && "border-red focus:border-red focus:shadow-none",
              trailing && "pr-11",
              className,
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute inset-y-0 right-2 flex items-center">
              {trailing}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-red">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
