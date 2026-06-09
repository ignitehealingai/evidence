"use client";

import { useMemo } from "react";
import { evidenceCategoryLabel, getProfile } from "@/config";
import { useEntries, useSessions } from "@/lib/storage";
import { computeStats } from "@/lib/stats";
import { Button, Screen, SectionLabel } from "@/components/ui";

export default function EvidenceDashboard() {
  const profile = getProfile();
  const entries = useEntries();
  const sessions = useSessions();

  const stats = useMemo(
    () => computeStats(profile, entries, sessions),
    [profile, entries, sessions]
  );

  const hasAnything = stats.totalEvidence > 0 || stats.checkIns > 0;

  return (
    <Screen title="Proof I’m changing" back="/">
      {!hasAnything && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg text-mist">No evidence logged yet.</p>
          <p className="max-w-xs text-sm text-fog">
            That&rsquo;s not a failure — it just means you&rsquo;re at the
            beginning. The first pause counts.
          </p>
          <div className="mt-6 w-full space-y-3">
            <Button href="/log-win">Log a win</Button>
            <Button variant="soft" href="/intensity">
              I need intensity
            </Button>
          </div>
        </div>
      )}

      {hasAnything && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="pieces of evidence" value={stats.totalEvidence} />
            <StatCard label="check-ins completed" value={stats.checkIns} />
          </div>

          {stats.counts.length > 0 && (
            <>
              <SectionLabel>By category</SectionLabel>
              <div className="space-y-2">
                {stats.counts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3"
                  >
                    <span className="text-sm text-mist">{c.label}</span>
                    <span className="text-base font-semibold tabular-nums text-glow">
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-calm">
                Look how many times you chose differently.
              </p>
            </>
          )}

          {stats.topDysregulators.length > 0 && (
            <>
              <SectionLabel>Your most common dysregulators</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {stats.topDysregulators.map((d) => (
                  <span
                    key={d.label}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-fog"
                  >
                    {d.label} · {d.count}
                  </span>
                ))}
              </div>
            </>
          )}

          {entries.length > 0 && (
            <>
              <SectionLabel>Recent evidence</SectionLabel>
              <ul className="space-y-2">
                {entries.slice(0, 25).map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-2xl border border-line bg-surface px-4 py-3"
                  >
                    <p className="text-sm text-mist">{entry.text}</p>
                    <p className="mt-1 text-xs text-fog">
                      {evidenceCategoryLabel(profile, entry.category)} ·{" "}
                      {formatDate(entry.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-8">
            <Button href="/log-win">Log a win</Button>
          </div>
        </>
      )}
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-5 text-center">
      <p className="text-3xl font-bold tabular-nums text-glow">{value}</p>
      <p className="mt-1 text-xs text-fog">{label}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
