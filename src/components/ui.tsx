"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Option } from "@/config/types";

export function Screen({
  title,
  back = "/",
  onBack,
  children,
}: {
  title?: string;
  back?: string | null;
  /** When provided, the back button calls this instead of navigating. */
  onBack?: () => void;
  children: ReactNode;
}) {
  const backButtonClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-mist active:bg-line";
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-12 pt-6">
      <header className="mb-6 flex items-center gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className={backButtonClass}
          >
            ←
          </button>
        ) : (
          back && (
            <Link href={back} aria-label="Back" className={backButtonClass}>
              ←
            </Link>
          )
        )}
        {title && (
          <h1 className="text-lg font-semibold tracking-wide text-mist">
            {title}
          </h1>
        )}
      </header>
      {children}
    </main>
  );
}

export function ChipGrid({
  options,
  selected,
  onChange,
  single = false,
}: {
  options: Option[];
  selected: string[];
  onChange: (ids: string[]) => void;
  single?: boolean;
}) {
  function toggle(id: string) {
    if (single) {
      onChange(selected.includes(id) ? [] : [id]);
    } else {
      onChange(
        selected.includes(id)
          ? selected.filter((s) => s !== id)
          : [...selected, id]
      );
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(option.id)}
            className={`rounded-full border px-4 py-2.5 text-sm transition ${
              on
                ? "border-glow bg-glow/15 font-medium text-glow"
                : "border-line bg-surface text-mist active:bg-line"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type ButtonVariant = "primary" | "soft" | "ghost";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "block w-full rounded-2xl bg-glow px-5 py-4 text-center text-base font-semibold text-night shadow-lg shadow-glow/15 transition active:scale-[0.99] disabled:opacity-40",
  soft: "block w-full rounded-2xl border border-line bg-surface px-5 py-4 text-center text-base font-medium text-mist transition active:bg-line disabled:opacity-40",
  ghost:
    "block w-full rounded-2xl px-5 py-3 text-center text-sm text-fog underline-offset-4 transition active:text-mist",
};

export function Button({
  children,
  onClick,
  href,
  variant = "primary",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
}) {
  if (href) {
    return (
      <Link href={href} className={buttonStyles[variant]}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={buttonStyles[variant]}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-fog">
      {children}
    </p>
  );
}

export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-5 flex gap-1.5" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i < step ? "bg-glow" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}
