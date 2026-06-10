"use client";

import { useMemo, useState } from "react";
import { getProfile } from "@/config";
import { useEntries, useSessions } from "@/lib/storage";
import {
  EVENT_KINDS,
  WINDOW_OPTIONS,
  beforeCaving,
  cravingsByDayOfWeek,
  cravingsByTimeOfDay,
  interventionEffects,
  sequenceReport,
  urgeCounts,
  type CountRow,
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
  const byTime = useMemo(() => cravingsByTimeOfDay(sessions), [sessions]);
  const byDay = useMemo(() => cravingsByDayOfWeek(sessions), [sessions]);
  const cavePattern = useMemo(
    () => beforeCaving(profile, sessions),
    [profile, sessions]
  );
  const urges = useMemo(
    () => urgeCounts(profile, sessions),
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
      <SectionLabel>When do cravings hit?</SectionLabel>
      {sessions.length === 0 ? (
        <p className="text-sm text-fog">
          This fills in as you complete check-ins.
        </p>
      ) : (
        <>
          <BarList rows={byTime} />
          {byDay.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-xs text-fog">By day of week:</p>
              <BarList rows={byDay} />
            </>
          )}
        </>
      )}

      <SectionLabel>What shows up before I cave?</SectionLabel>
      {cavePattern.cavedSessions === 0 ? (
        <p className="text-sm text-fog">
          No check-ins have ended with &ldquo;I acted on it.&rdquo; If one
          ever does, this will show what was underneath it — information,
          not a verdict.
        </p>
      ) : (
        <>
          <p className="mb-2 text-xs text-fog">
            Across the {cavePattern.cavedSessions}{" "}
            {cavePattern.cavedSessions === 1 ? "check-in" : "check-ins"} that
            ended with &ldquo;I acted on it,&rdquo; these were checked most:
          </p>
          {cavePattern.topDysregulators.length > 0 && (
            <BarList rows={cavePattern.topDysregulators} />
          )}
          {cavePattern.topFeelings.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-xs text-fog">Feelings:</p>
              <BarList rows={cavePattern.topFeelings} />
            </>
          )}
        </>
      )}

      <SectionLabel>What do I reach for?</SectionLabel>
      {urges.length === 0 ? (
        <p className="text-sm text-fog">
          This will show which urges come up most in your check-ins.
        </p>
      ) : (
        <BarList rows={urges} />
      )}
    </Screen>
  );
}

function BarList({ rows }: { rows: CountRow[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="space-y-1.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2">
          <span className="w-36 shrink-0 truncate text-xs text-mist">
            {row.label}
          </span>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-glow/70"
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs tabular-nums text-fog">
            {row.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatGap(minutes: number): string {
  if (minutes < 1) return "a minute";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  return hours < 1.5 ? "an hour" : `${Math.round(hours)} hours`;
}
