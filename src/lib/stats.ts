// Dashboard aggregation: turns raw evidence entries and intensity sessions
// into the "Proof I'm Changing" counts. No streaks — evidence over perfection.

import type { Profile } from "@/config/types";
import { optionLabel } from "@/config";
import type { EvidenceEntry, IntensitySession } from "./types";

export type DashboardStats = {
  /** EvidenceCategory id -> count (only categories with at least one). */
  counts: { id: string; label: string; count: number }[];
  totalEvidence: number;
  checkIns: number;
  /** Most frequent dysregulators across sessions, with labels. */
  topDysregulators: { label: string; count: number }[];
};

export function computeStats(
  profile: Profile,
  entries: EvidenceEntry[],
  sessions: IntensitySession[]
): DashboardStats {
  // Every count comes from exactly one logged entry — one tap, one count.
  // Nothing is derived or double-counted.
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
  }

  const orderedCounts = profile.evidenceCategories
    .map((c) => ({ id: c.id, label: c.label, count: counts.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const dysregulatorCounts = new Map<string, number>();
  for (const session of sessions) {
    for (const id of session.dysregulators) {
      dysregulatorCounts.set(id, (dysregulatorCounts.get(id) ?? 0) + 1);
    }
  }
  const topDysregulators = [...dysregulatorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count]) => ({ label: optionLabel(profile, id), count }));

  return {
    counts: orderedCounts,
    totalEvidence: entries.length,
    checkIns: sessions.length,
    topDysregulators,
  };
}
