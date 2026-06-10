"use client";

import { useState } from "react";
import { addEntry, useEntries } from "@/lib/storage";
import { Button, Screen, SectionLabel } from "@/components/ui";

export default function Thankful() {
  const [text, setText] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const entries = useEntries();

  const recentGratitudes = entries
    .filter((e) => e.category === "gratitude")
    .slice(0, 10);

  function save() {
    if (!text.trim()) return;
    addEntry({ text: text.trim(), category: "gratitude", source: "gratitude" });
    setText("");
    setSavedCount((c) => c + 1);
  }

  return (
    <Screen title="I am thankful for" back="/">
      <p className="mb-4 text-sm text-fog">
        Add as many as you want. Each one is saved.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="I am thankful for..."
        rows={2}
        autoFocus
        className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-mist placeholder:text-fog/60 focus:border-glow focus:outline-none"
      />
      <div className="mt-4">
        <Button onClick={save} disabled={!text.trim()}>
          Save{savedCount > 0 ? " another" : ""}
        </Button>
      </div>

      {savedCount > 0 && (
        <p className="mt-4 text-center text-sm text-calm">
          {savedCount === 1
            ? "Saved. Gratitude counts as evidence."
            : `${savedCount} saved. Keep going if more come.`}
        </p>
      )}

      {recentGratitudes.length > 0 && (
        <>
          <SectionLabel>Recent gratitudes</SectionLabel>
          <ul className="space-y-2">
            {recentGratitudes.map((entry) => (
              <li
                key={entry.id}
                className="rounded-2xl border border-line bg-surface px-4 py-3"
              >
                <p className="text-sm text-mist">{entry.text}</p>
                <p className="mt-1 text-xs text-fog">
                  {formatDateTime(entry.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Screen>
  );
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })} · ${d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } catch {
    return "";
  }
}
