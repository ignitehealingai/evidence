"use client";

import { useMemo, useState } from "react";
import { evidenceCategoryLabel, getProfile } from "@/config";
import {
  clearAllData,
  deleteEntry,
  updateEntry,
  useEntries,
  useSessions,
} from "@/lib/storage";
import { computeStats } from "@/lib/stats";
import { Button, ChipGrid, Screen, SectionLabel } from "@/components/ui";

export default function EvidenceDashboard() {
  const profile = getProfile();
  const entries = useEntries();
  const sessions = useSessions();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("other");
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  function saveEdit() {
    if (!editingId || !editText.trim()) return;
    updateEntry(editingId, { text: editText.trim(), category: editCategory });
    setEditingId(null);
  }

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
              <p className="mb-2 text-xs text-fog">
                Tap a category to see the entries behind the number.
              </p>
              <div className="space-y-2">
                {stats.counts.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-line bg-surface"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCategory(openCategory === c.id ? null : c.id)
                      }
                      className="flex w-full items-center justify-between px-4 py-3"
                    >
                      <span className="text-sm text-mist">{c.label}</span>
                      <span className="text-base font-semibold tabular-nums text-glow">
                        {c.count}
                      </span>
                    </button>
                    {openCategory === c.id && (
                      <ul className="space-y-2 border-t border-line px-4 py-3">
                        {entries
                          .filter((e) => e.category === c.id)
                          .map((e) => (
                            <li key={e.id} className="text-sm text-mist">
                              {e.text}
                              <span className="ml-2 text-xs text-fog">
                                {formatDate(e.createdAt)}
                              </span>
                            </li>
                          ))}
                        {entries.filter((e) => e.category === c.id).length ===
                          0 && (
                          <li className="text-xs text-fog">
                            No written entries in this category yet.
                          </li>
                        )}
                      </ul>
                    )}
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
                {entries.slice(0, 25).map((entry) =>
                  editingId === entry.id ? (
                    <li
                      key={entry.id}
                      className="rounded-2xl border border-glow/50 bg-surface px-4 py-3"
                    >
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        autoFocus
                        className="w-full rounded-xl border border-line bg-deep px-3 py-2 text-sm text-mist focus:border-glow focus:outline-none"
                      />
                      <div className="mt-2">
                        <ChipGrid
                          options={profile.evidenceCategories.map((c) => ({
                            id: c.id,
                            label: c.label,
                          }))}
                          selected={[editCategory]}
                          onChange={(ids) =>
                            setEditCategory(ids[0] ?? "other")
                          }
                          single
                        />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={!editText.trim()}
                          className="flex-1 rounded-xl bg-glow px-4 py-2 text-sm font-semibold text-night disabled:opacity-40"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex-1 rounded-xl border border-line px-4 py-2 text-sm text-fog"
                        >
                          Cancel
                        </button>
                      </div>
                    </li>
                  ) : (
                    <li
                      key={entry.id}
                      className="rounded-2xl border border-line bg-surface px-4 py-3"
                    >
                      <p className="text-sm text-mist">{entry.text}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-fog">
                          {evidenceCategoryLabel(profile, entry.category)} ·{" "}
                          {formatDate(entry.createdAt)}
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(entry.id);
                              setEditText(entry.text);
                              setEditCategory(entry.category);
                            }}
                            className="text-xs text-fog underline underline-offset-2"
                          >
                            edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm("Delete this entry?")
                              ) {
                                deleteEntry(entry.id);
                              }
                            }}
                            className="text-xs text-fog underline underline-offset-2"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </>
          )}

          <div className="mt-8 space-y-3">
            <Button href="/log-win">Log a win</Button>
            <Button variant="soft" href="/reports">
              Reports — find my patterns
            </Button>
          </div>

          <div className="mt-10 border-t border-line pt-5 text-center">
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Erase all logged data from this device? This removes every entry, check-in, and decision. It cannot be undone."
                  )
                ) {
                  clearAllData();
                }
              }}
              className="text-xs text-fog underline underline-offset-2"
            >
              Erase all data on this device
            </button>
            <p className="mt-2 text-[11px] text-fog/70">
              Useful for clearing test entries. Starting fresh is allowed.
            </p>
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
