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

const CRAVING_SURVIVED_OUTCOMES = new Set(["craving-passed", "craving-decreased"]);

export function computeStats(
  profile: Profile,
  entries: EvidenceEntry[],
  sessions: IntensitySession[]
): DashboardStats {
  const counts = new Map<string, number>();
  const bump = (id: string, by = 1) => counts.set(id, (counts.get(id) ?? 0) + by);

  for (const entry of entries) {
    bump(entry.category);
  }

  // Sessions contribute derived evidence: pausing, surviving a craving, and
  // reaching out all count, even if the user didn't write anything down.
  for (const session of sessions) {
    if (session.outcomes.includes("paused")) bump("pause");
    if (session.outcomes.includes("reached-out")) bump("support");
    if (session.outcomes.some((o) => CRAVING_SURVIVED_OUTCOMES.has(o))) {
      bump("craving-survived");
    }
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
    totalEvidence:
      orderedCounts.reduce((sum, c) => sum + c.count, 0),
    checkIns: sessions.length,
    topDysregulators,
  };
}
