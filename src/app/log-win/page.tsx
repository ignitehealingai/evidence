"use client";

import { useState } from "react";
import { getProfile } from "@/config";
import { addEntry } from "@/lib/storage";
import { Button, ChipGrid, Screen, SectionLabel } from "@/components/ui";

export default function LogWin() {
  const profile = getProfile();
  const [text, setText] = useState("");
  const [category, setCategory] = useState("other");
  const [saved, setSaved] = useState(false);

  function save() {
    if (!text.trim()) return;
    addEntry({ text: text.trim(), category, source: "win" });
    setSaved(true);
  }

  if (saved) {
    return (
      <Screen back="/">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="text-3xl font-semibold text-glow">Evidence counts.</p>
          <p className="text-sm text-fog">One more proof that you&rsquo;re changing.</p>
          <div className="mt-10 w-full space-y-3">
            <Button
              variant="soft"
              onClick={() => {
                setText("");
                setCategory("other");
                setSaved(false);
              }}
            >
              Log another win
            </Button>
            <Button href="/evidence">See all my evidence</Button>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Log a win" back="/">
      <p className="mb-4 text-sm text-fog">
        Any size counts. Especially the small ones.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What did you do differently?"
        rows={3}
        autoFocus
        className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-mist placeholder:text-fog/60 focus:border-glow focus:outline-none"
      />

      <SectionLabel>Need a starting point?</SectionLabel>
      <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto">
        {profile.evidenceExamples.map((example) => (
          <button
            key={example.text}
            type="button"
            onClick={() => {
              setText(example.text);
              setCategory(example.category);
            }}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-fog transition active:bg-line"
          >
            {example.text}
          </button>
        ))}
      </div>

      <SectionLabel>Count it as</SectionLabel>
      <ChipGrid
        options={profile.evidenceCategories.map((c) => ({
          id: c.id,
          label: c.label,
        }))}
        selected={[category]}
        onChange={(ids) => setCategory(ids[0] ?? "other")}
        single
      />

      <div className="mt-8">
        <Button onClick={save} disabled={!text.trim()}>
          Save evidence
        </Button>
      </div>
    </Screen>
  );
}
