"use client";

import Link from "next/link";
import { useDraft } from "@/lib/storage";

/**
 * Shown on the home screen when a check-in was started but not finished —
 * the draft is saved after every tap, so it can be picked back up anytime.
 */
export function ResumeBanner() {
  const draft = useDraft();
  const inProgress =
    draft && (draft.step !== "urge" || draft.urges.length > 0);
  if (!inProgress) return null;

  return (
    <Link
      href="/intensity"
      className="block rounded-2xl border border-glow/50 bg-glow/10 px-5 py-4 text-center transition active:bg-glow/20"
    >
      <span className="block text-sm font-semibold text-glow">
        You have an unfinished check-in
      </span>
      <span className="mt-0.5 block text-xs text-fog">
        Pick up where you left off — nothing was lost
      </span>
    </Link>
  );
}
