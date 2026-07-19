// Report computations over locally stored entries and sessions.

import type { Profile } from "@/config/types";
import { interventionLabel, optionLabel } from "@/config";
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

export type ActionEffect = {
  interventionId: string;
  label: string;
  total: number;
  helped: number;
};

const HELPED_OUTCOMES = new Set(["craving-passed", "craving-decreased"]);

/**
 * For each specific action that was actually tried, how often the
 * reflection said the craving passed or decreased afterwards. Top N by
 * helpfulness — the user's personal "most helpful intervening actions".
 */
export function actionEffects(
  profile: Profile,
  sessions: IntensitySession[],
  limit = 10
): ActionEffect[] {
  const byAction = new Map<string, { total: number; helped: number }>();
  for (const session of sessions) {
    if (!session.interventionId) continue;
    const bucket = byAction.get(session.interventionId) ?? {
      total: 0,
      helped: 0,
    };
    bucket.total += 1;
    if (session.outcomes.some((o) => HELPED_OUTCOMES.has(o))) {
      bucket.helped += 1;
    }
    byAction.set(session.interventionId, bucket);
  }

  return [...byAction.entries()]
    .map(([interventionId, { total, helped }]) => ({
      interventionId,
      label: interventionLabel(profile, interventionId),
      total,
      helped,
    }))
    .sort(
      (a, b) => b.helped / b.total - a.helped / a.total || b.total - a.total
    )
    .slice(0, limit);
}

export type CountRow = { label: string; count: number };

const TIME_BUCKETS = [
  { label: "Early morning (5–9am)", from: 5, to: 9 },
  { label: "Morning (9–12)", from: 9, to: 12 },
  { label: "Afternoon (12–5pm)", from: 12, to: 17 },
  { label: "Evening (5–9pm)", from: 17, to: 21 },
  { label: "Night (9pm–12)", from: 21, to: 24 },
  { label: "Late night (12–5am)", from: 0, to: 5 },
];

/** When check-ins (cravings) start, bucketed by time of day. */
export function cravingsByTimeOfDay(sessions: IntensitySession[]): CountRow[] {
  const counts = TIME_BUCKETS.map(() => 0);
  for (const session of sessions) {
    const d = new Date(session.startedAt);
    if (Number.isNaN(d.getTime())) continue;
    const hour = d.getHours();
    const i = TIME_BUCKETS.findIndex((b) => hour >= b.from && hour < b.to);
    if (i >= 0) counts[i] += 1;
  }
  return TIME_BUCKETS.map((b, i) => ({ label: b.label, count: counts[i] }));
}

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Check-ins by day of week, ordered by frequency. */
export function cravingsByDayOfWeek(sessions: IntensitySession[]): CountRow[] {
  const counts = new Array(7).fill(0);
  for (const session of sessions) {
    const d = new Date(session.startedAt);
    if (!Number.isNaN(d.getTime())) counts[d.getDay()] += 1;
  }
  return DAY_LABELS.map((label, i) => ({ label, count: counts[i] }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
}

export type CavePattern = {
  cavedSessions: number;
  topDysregulators: CountRow[];
  topFeelings: CountRow[];
};

/** What was checked during the check-ins that ended in "I acted on it". */
export function beforeCaving(
  profile: Profile,
  sessions: IntensitySession[]
): CavePattern {
  const caved = sessions.filter((s) => s.outcomes.includes("acted-on-it"));

  const tally = (ids: string[][]): CountRow[] => {
    const counts = new Map<string, number>();
    for (const list of ids) {
      for (const id of list) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, count]) => ({ label: optionLabel(profile, id), count }));
  };

  return {
    cavedSessions: caved.length,
    topDysregulators: tally(caved.map((s) => s.dysregulators)),
    topFeelings: tally(caved.map((s) => s.feelings)),
  };
}

export type PathComparison = {
  /** Check-ins that did NOT end with "I acted on it". */
  rodeItOut: { total: number; followedByWin: number };
  /** Check-ins that ended with "I acted on it". */
  acted: { total: number; followedByWin: number };
  windowHours: number;
};

/**
 * After each kind of check-in, how often a win was logged within the window.
 * Framed as information about what follows each path — never a scoreboard.
 */
export function winsAfterEachPath(
  entries: EvidenceEntry[],
  sessions: IntensitySession[],
  windowHours = 24
): PathComparison {
  // Deliberate wins only (Log a Win), not gratitudes and not the reflection
  // chips saved moments after the check-in itself — those blur the signal.
  const winTimes = entries
    .filter((e) => e.source === "win")
    .map((e) => new Date(e.createdAt).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);

  const windowMs = windowHours * 3_600_000;

  const followed = (sessionList: IntensitySession[]) => {
    let count = 0;
    for (const session of sessionList) {
      const t = new Date(session.completedAt).getTime();
      if (!Number.isFinite(t)) continue;
      if (winTimes.some((w) => w > t && w - t <= windowMs)) count += 1;
    }
    return count;
  };

  const acted = sessions.filter((s) => s.outcomes.includes("acted-on-it"));
  const rode = sessions.filter((s) => !s.outcomes.includes("acted-on-it"));

  return {
    rodeItOut: { total: rode.length, followedByWin: followed(rode) },
    acted: { total: acted.length, followedByWin: followed(acted) },
    windowHours,
  };
}

/** What the user most often wants to do when intensity hits. */
export function urgeCounts(
  profile: Profile,
  sessions: IntensitySession[]
): CountRow[] {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    const urges = session.urges ?? (session.urge ? [session.urge] : []);
    for (const urge of urges) {
      counts.set(urge, (counts.get(urge) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count]) => ({ label: optionLabel(profile, id), count }));
}
