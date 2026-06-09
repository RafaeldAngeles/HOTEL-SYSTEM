import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "gold";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

/**
 * Design system · Button
 * padding 8px 18px · radius 8px · 12px/500 · estados hover/focus/active/disabled
 */
const variants: Record<Variant, string> = {
  primary:
    "bg-blue text-white border border-transparent hover:bg-blue-dark",
  ghost:
    "bg-transparent text-ink-2 border border-border hover:bg-surface",
  gold:
    "bg-amber-bg text-[#92400E] border border-[#FCD34D] hover:bg-[#FEF3C7]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 select-none",
          "px-[18px] py-2 rounded-md text-xs font-medium leading-none",
          "transition-[background-color,transform,box-shadow] duration-150",
          "focus:outline-none focus-visible:shadow-focus",
          "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
