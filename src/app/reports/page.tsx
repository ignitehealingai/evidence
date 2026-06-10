"use client";

import { useMemo, useState } from "react";
import { getProfile } from "@/config";
import { useEntries, useSessions } from "@/lib/storage";
import {
  EVENT_KINDS,
  WINDOW_OPTIONS,
  interventionEffects,
  sequenceReport,
} from "@/lib/reports";
import { ChipGrid, Screen, SectionLabel } from "@/components/ui";

export default function Reports() {
  const profile = getProfile();
  const entries = useEntries();
  const sessions = useSessions();

  const [firstId, setFirstId] = useState("win");
  const [secondId, setSecondId] = useState("gratitude");
  const [windowId, setWindowId] = useState("10m");

  const first = EVENT_KINDS.find((k) => k.id === firstId);
  const second = EVENT_KINDS.find((k) => k.id === secondId);
  const window = WINDOW_OPTIONS.find((w) => w.id === windowId);

  const result = useMemo(() => {
    if (!first || !second || !window) return null;
    return sequenceReport(
      first.times(entries, sessions),
      second.times(entries, sessions),
      window.minutes
    );
  }, [first, second, window, entries, sessions]);

  const effects = useMemo(
    () => interventionEffects(profile, sessions),
    [profile, sessions]
  );

  const kindOptions = EVENT_KINDS.map((k) => ({ id: k.id, label: k.label }));

  return (
    <Screen title="Reports" back="/evidence">
      <p className="mb-5 text-sm text-fog">
        Patterns, not judgement. These only count what you logged.
      </p>

      <SectionLabel>After I…</SectionLabel>
      <ChipGrid
        options={kindOptions}
        selected={[firstId]}
        onChange={(ids) => setFirstId(ids[0] ?? "win")}
        single
      />

      <SectionLabel>…how often did I…</SectionLabel>
      <ChipGrid
        options={kindOptions}
        selected={[secondId]}
        onChange={(ids) => setSecondId(ids[0] ?? "gratitude")}
        single
      />

      <SectionLabel>…within…</SectionLabel>
      <ChipGrid
        options={WINDOW_OPTIONS.map((w) => ({ id: w.id, label: w.label }))}
        selected={[windowId]}
        onChange={(ids) => setWindowId(ids[0] ?? "10m")}
        single
      />

      {result && first && second && window && (
        <div className="mt-6 rounded-2xl border border-glow/40 bg-glow/10 px-5 py-5">
          {result.firstCount === 0 ? (
            <p className="text-sm text-mist">
              You haven&rsquo;t {first.label} yet, so there&rsquo;s nothing to
              count. That changes the first time you log one.
            </p>
          ) : (
            <>
              <p className="text-3xl font-bold text-glow">
                {Math.round((result.followedCount / result.firstCount) * 100)}%
              </p>
              <p className="mt-2 text-sm leading-relaxed text-mist">
                You {first.label} {result.firstCount}{" "}
                {result.firstCount === 1 ? "time" : "times"}. After{" "}
                {result.followedCount} of those, you {second.label} within{" "}
                {window.label}
                {result.medianGapMinutes !== null &&
                  ` — typically after about ${formatGap(
                    result.medianGapMinutes
                  )}`}
                .
              </p>
            </>
          )}
        </div>
      )}

      <SectionLabel>What seems to work</SectionLabel>
      {effects.length === 0 ? (
        <p className="text-sm text-fog">
          Once you&rsquo;ve completed a few check-ins, this will show which
          interventions most often ended with the craving passing or easing.
        </p>
      ) : (
        <div className="space-y-2">
          {effects.map((e) => (
            <div
              key={e.categoryId}
              className="rounded-2xl border border-line bg-surface px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-mist">
                  {e.categoryName}
                </span>
                <span className="text-sm font-semibold tabular-nums text-glow">
                  {Math.round((e.helped / e.total) * 100)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-fog">
                craving passed or eased after {e.helped} of {e.total}{" "}
                {e.total === 1 ? "try" : "tries"}
              </p>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}

function formatGap(minutes: number): string {
  if (minutes < 1) return "a minute";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  return hours < 1.5 ? "an hour" : `${Math.round(hours)} hours`;
}
