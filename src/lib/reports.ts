// Report computations over locally stored entries and sessions.

import type { Profile } from "@/config/types";
import type { EvidenceEntry, IntensitySession } from "./types";

export type EventKindId =
  | "win"
  | "gratitude"
  | "any-evidence"
  | "check-in"
  | "reached-out"
  | "paused"
  | "decision-delayed";

export type EventKind = {
  id: EventKindId;
  /** Reads naturally after "After I..." and "...did I". */
  label: string;
  times: (entries: EvidenceEntry[], sessions: IntensitySession[]) => number[];
};

const entryTimes = (
  entries: EvidenceEntry[],
  match: (e: EvidenceEntry) => boolean
) =>
  entries
    .filter(match)
    .map((e) => new Date(e.createdAt).getTime())
    .filter((t) => Number.isFinite(t));

export const EVENT_KINDS: EventKind[] = [
  {
    id: "win",
    label: "logged a win",
    times: (entries) => entryTimes(entries, (e) => e.source === "win"),
  },
  {
    id: "gratitude",
    label: "added a gratitude",
    times: (entries) => entryTimes(entries, (e) => e.category === "gratitude"),
  },
  {
    id: "any-evidence",
    label: "logged any evidence",
    times: (entries) => entryTimes(entries, () => true),
  },
  {
    id: "check-in",
    label: "completed a check-in",
    times: (_entries, sessions) =>
      sessions
        .map((s) => new Date(s.completedAt).getTime())
        .filter((t) => Number.isFinite(t)),
  },
  {
    id: "reached-out",
    label: "reached out for support",
    times: (entries) => entryTimes(entries, (e) => e.category === "support"),
  },
  {
    id: "paused",
    label: "logged a pause",
    times: (entries) => entryTimes(entries, (e) => e.category === "pause"),
  },
  {
    id: "decision-delayed",
    label: "delayed a big decision",
    times: (entries) =>
      entryTimes(entries, (e) => e.category === "decision-delayed"),
  },
];

export type WindowOption = { id: string; label: string; minutes: number };

export const WINDOW_OPTIONS: WindowOption[] = [
  { id: "10m", label: "10 minutes", minutes: 10 },
  { id: "30m", label: "30 minutes", minutes: 30 },
  { id: "1h", label: "an hour", minutes: 60 },
  { id: "1d", label: "a day", minutes: 60 * 24 },
];

export type SequenceResult = {
  firstCount: number;
  followedCount: number;
  /** Median minutes between the pairs that matched, or null. */
  medianGapMinutes: number | null;
};

/**
 * Of all "first" events, how many were followed by a "second" event within
 * the window? Each first event matches at most once (the nearest follower).
 */
export function sequenceReport(
  firstTimes: number[],
  secondTimes: number[],
  windowMinutes: number
): SequenceResult {
  const windowMs = windowMinutes * 60_000;
  const seconds = [...secondTimes].sort((a, b) => a - b);
  const gaps: number[] = [];
  let followedCount = 0;

  for (const t of firstTimes) {
    // Nearest second-event strictly after the first (> avoids counting the
    // same entry against itself when both kinds overlap).
    const follower = seconds.find((s) => s > t && s - t <= windowMs);
    if (follower !== undefined) {
      followedCount += 1;
      gaps.push((follower - t) / 60_000);
    }
  }

  gaps.sort((a, b) => a - b);
  const medianGapMinutes =
    gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : null;

  return { firstCount: firstTimes.length, followedCount, medianGapMinutes };
}

export type InterventionEffect = {
  categoryId: string;
  categoryName: string;
  total: number;
  helped: number;
};

const HELPED_OUTCOMES = new Set(["craving-passed", "craving-decreased"]);

/**
 * For each intervention category that was actually tried, how often the
 * reflection said the craving passed or decreased afterwards.
 */
export function interventionEffects(
  profile: Profile,
  sessions: IntensitySession[]
): InterventionEffect[] {
  const byCategory = new Map<string, { total: number; helped: number }>();
  for (const session of sessions) {
    if (!session.categoryId) continue;
    const bucket = byCategory.get(session.categoryId) ?? {
      total: 0,
      helped: 0,
    };
    bucket.total += 1;
    if (session.outcomes.some((o) => HELPED_OUTCOMES.has(o))) {
      bucket.helped += 1;
    }
    byCategory.set(session.categoryId, bucket);
  }

  return [...byCategory.entries()]
    .map(([categoryId, { total, helped }]) => ({
      categoryId,
      categoryName:
        profile.interventionCategories.find((c) => c.id === categoryId)
          ?.name ?? categoryId,
      total,
      helped,
    }))
    .sort(
      (a, b) => b.helped / b.total - a.helped / a.total || b.total - a.total
    );
}
