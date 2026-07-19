"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/config";
import type { Profile } from "@/config/types";
import type { CheckInDraft } from "@/lib/types";
import {
  addEntry,
  addSession,
  clearDraft,
  nowIso,
  saveDraft,
  useDraft,
} from "@/lib/storage";
import { Button, ChipGrid, Screen, SectionLabel, StepDots } from "@/components/ui";

const STEP_ORDER: CheckInDraft["step"][] = [
  "urge",
  "body",
  "feelings",
  "context",
  "pause",
  "try",
  "reflect",
];

const EMPTY_DRAFT: CheckInDraft = {
  step: "urge",
  startedAt: "",
  urges: [],
  body: [],
  feelings: [],
  dysregulators: [],
  interventionId: null,
  outcomes: [],
  selectedExamples: [],
  evidenceText: "",
  evidenceCategory: "other",
};

const TIMER_SECONDS = 10 * 60;

export default function IntensityFlow() {
  const profile = getProfile();
  const stored = useDraft();
  const [finished, setFinished] = useState(false);

  const d = stored ?? EMPTY_DRAFT;
  const step = finished ? "done" : d.step;

  // Every change persists immediately — closing the app loses nothing.
  function update(patch: Partial<CheckInDraft>) {
    saveDraft({ ...d, startedAt: d.startedAt || nowIso(), ...patch });
  }

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  function goBack() {
    const i = STEP_ORDER.indexOf(d.step);
    if (i > 0) update({ step: STEP_ORDER[i - 1] });
  }

  function finish() {
    addSession({
      startedAt: d.startedAt || nowIso(),
      completedAt: nowIso(),
      feelings: d.feelings,
      dysregulators: d.dysregulators,
      body: d.body,
      urges: d.urges,
      urge: d.urges[0],
      interventionId: d.interventionId ?? undefined,
      outcomes: d.outcomes,
    });
    for (const text of d.selectedExamples) {
      const example = profile.evidenceExamples.find((e) => e.text === text);
      addEntry({
        text,
        category: example?.category ?? "other",
        source: "reflection",
      });
    }
    if (d.evidenceText.trim()) {
      addEntry({
        text: d.evidenceText.trim(),
        category: d.evidenceCategory,
        source: "reflection",
      });
    }
    clearDraft();
    setFinished(true);
  }

  const stepIndex = STEP_ORDER.indexOf(d.step);
  const urgeReminder = d.urges
    .map((u) => profile.urgeReminders?.[u])
    .find(Boolean);

  return (
    <Screen
      title={step === "done" ? undefined : "I need intensity"}
      back={step === "urge" || step === "done" ? "/" : null}
      onBack={step !== "urge" && step !== "done" ? goBack : undefined}
    >
      {step !== "done" && <StepDots step={stepIndex + 1} total={7} />}

      {step === "urge" && (
        <SelectStep
          title="What do you want to do right now?"
          subtitle="Pick up to three. Naming it is not doing it."
          onNext={() => update({ step: "body" })}
        >
          <ChipGrid
            options={profile.urges}
            selected={d.urges}
            onChange={(ids) => update({ urges: ids })}
            maxSelected={3}
          />
        </SelectStep>
      )}

      {step === "body" && (
        <SelectStep
          title="What is happening in your body?"
          subtitle="Select all that apply."
          onNext={() => update({ step: "feelings" })}
        >
          <ChipGrid
            options={profile.bodySensations}
            selected={d.body}
            onChange={(ids) => update({ body: ids })}
          />
        </SelectStep>
      )}

      {step === "feelings" && (
        <SelectStep
          title="How are you feeling?"
          subtitle="Select all that apply. There are no wrong answers."
          onNext={() => update({ step: "context" })}
        >
          <ChipGrid
            options={profile.feelings}
            selected={d.feelings}
            onChange={(ids) => update({ feelings: ids })}
          />
        </SelectStep>
      )}

      {step === "context" && (
        <SelectStep
          title="What else is going on?"
          subtitle="This is pattern recognition, not analysis."
          onNext={() => update({ step: "pause" })}
        >
          {profile.dysregulatorGroups.map((group) => (
            <div key={group.id}>
              <SectionLabel>{group.label}</SectionLabel>
              <ChipGrid
                options={group.options}
                selected={d.dysregulators}
                onChange={(ids) => update({ dysregulators: ids })}
              />
            </div>
          ))}
        </SelectStep>
      )}

      {step === "pause" && (
        <div className="flex flex-1 flex-col">
          <div className="my-6 space-y-2 text-center">
            {profile.pauseMessage.map((line) => (
              <p key={line} className="text-xl font-medium text-mist">
                {line}
              </p>
            ))}
          </div>
          {urgeReminder && (
            <div className="mb-6 rounded-2xl border border-calm/40 bg-calm/10 px-4 py-4 text-center">
              <p className="text-sm leading-relaxed text-calm">
                {urgeReminder}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => update({ step: "try" })}
            className="block w-full rounded-3xl bg-calm px-6 py-8 text-center shadow-xl shadow-calm/20 transition active:scale-[0.99]"
          >
            <span className="block text-2xl font-bold text-night">
              TRY THIS
            </span>
            <span className="mt-1 block text-sm text-night/70">
              one small thing, 10 minutes
            </span>
          </button>
          <div className="mt-6">
            <Button variant="ghost" onClick={() => update({ step: "reflect" })}>
              Skip straight to reflection
            </Button>
          </div>
        </div>
      )}

      {step === "try" && (
        <div className="flex flex-1 flex-col">
          <h2 className="text-2xl font-semibold text-mist">Try one thing</h2>
          <p className="mt-1 text-sm text-fog">
            You can do anything for 10 minutes.
          </p>
          {profile.interventionGroups.map((group) => (
            <div key={group.id}>
              <SectionLabel>{group.label}</SectionLabel>
              <ChipGrid
                options={group.interventions}
                selected={d.interventionId ? [d.interventionId] : []}
                onChange={(ids) => update({ interventionId: ids[0] ?? null })}
                single
              />
            </div>
          ))}

          <div className="mt-6 space-y-3">
            {secondsLeft === null ? (
              <Button
                variant="soft"
                onClick={() => setSecondsLeft(TIMER_SECONDS)}
              >
                Start a 10-minute timer
              </Button>
            ) : (
              <div className="rounded-2xl border border-line bg-surface px-5 py-4 text-center">
                <p className="font-mono text-3xl tabular-nums text-glow">
                  {formatTime(secondsLeft)}
                </p>
                <p className="mt-1 text-xs text-fog">
                  {secondsLeft === 0
                    ? "You made it. That was a pause."
                    : "Just this one thing. Nothing else right now."}
                </p>
              </div>
            )}
            <Button onClick={() => update({ step: "reflect" })}>
              I tried it — reflect
            </Button>
            <p className="text-center text-xs text-fog">
              Everything is saved. If you close the app, you can finish the
              reflection later.
            </p>
          </div>
        </div>
      )}

      {step === "reflect" && (
        <div className="flex flex-1 flex-col">
          <div className="mb-6 rounded-2xl border border-calm/40 bg-calm/10 px-4 py-4 text-sm leading-relaxed text-mist">
            <p className="font-semibold text-calm">Permission is not action.</p>
            <p className="mt-2">
              I give myself permission to feel{" "}
              <span className="font-medium text-calm">
                {feelingLabels(profile, d.feelings)}
              </span>{" "}
              — without acting on it.
            </p>
            <p className="mt-2">
              These are human feelings. I&rsquo;m empowered to choose how I
              navigate them. I don&rsquo;t have to fall back on my numbing or
              escape patterns.
            </p>
          </div>
          <h2 className="text-2xl font-semibold text-mist">What happened?</h2>
          <div className="mt-4">
            <ChipGrid
              options={profile.reflectionOutcomes}
              selected={d.outcomes}
              onChange={(ids) => update({ outcomes: ids })}
            />
          </div>
          {d.outcomes.includes("acted-on-it") && (
            <div className="mt-4 rounded-2xl border border-glow/40 bg-glow/10 px-4 py-4">
              <p className="text-base font-semibold text-glow">
                {profile.actedOnIt.title}
              </p>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-mist">
                {profile.actedOnIt.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          )}

          <SectionLabel>Evidence that I&rsquo;m changing</SectionLabel>
          <p className="mb-2 text-xs text-fog">
            Tap everything that&rsquo;s true. More than one counts.
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.evidenceExamples.map((example) => {
              const on = d.selectedExamples.includes(example.text);
              return (
                <button
                  key={example.text}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    update({
                      selectedExamples: on
                        ? d.selectedExamples.filter((t) => t !== example.text)
                        : [...d.selectedExamples, example.text],
                    })
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    on
                      ? "border-glow bg-glow/15 font-medium text-glow"
                      : "border-line bg-surface text-fog active:bg-line"
                  }`}
                >
                  {example.text}
                </button>
              );
            })}
          </div>

          <SectionLabel>Add your own (optional)</SectionLabel>
          <textarea
            value={d.evidenceText}
            onChange={(e) => update({ evidenceText: e.target.value })}
            placeholder="What else did you do differently?"
            rows={2}
            className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-mist placeholder:text-fog/60 focus:border-glow focus:outline-none"
          />

          {d.evidenceText.trim() && (
            <>
              <SectionLabel>Count it as</SectionLabel>
              <ChipGrid
                options={profile.evidenceCategories.map((c) => ({
                  id: c.id,
                  label: c.label,
                }))}
                selected={[d.evidenceCategory]}
                onChange={(ids) =>
                  update({ evidenceCategory: ids[0] ?? "other" })
                }
                single
              />
            </>
          )}

          <div className="mt-6">
            <Button onClick={finish}>Save evidence</Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="text-3xl font-semibold text-glow">You noticed.</p>
          <p className="text-xl text-mist">You paused.</p>
          <p className="text-xl text-mist">You came back.</p>
          <p className="mt-2 text-sm text-fog">Evidence counts.</p>
          <div className="mt-10 w-full space-y-3">
            <Button href="/evidence">Show me evidence I&rsquo;m changing</Button>
            <Button variant="soft" href="/">
              Back home
            </Button>
          </div>
        </div>
      )}
    </Screen>
  );
}

function SelectStep({
  title,
  subtitle,
  onNext,
  children,
}: {
  title: string;
  subtitle: string;
  onNext: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-2xl font-semibold text-mist">{title}</h2>
      <p className="mb-4 mt-1 text-sm text-fog">{subtitle}</p>
      <div className="flex-1">{children}</div>
      <div className="sticky bottom-4 mt-8">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}

function feelingLabels(profile: Profile, selected: string[]): string {
  const labels = selected
    .filter((id) => id !== "dont-know")
    .map((id) => profile.feelings.find((f) => f.id === id)?.label)
    .filter((label): label is string => Boolean(label));
  if (labels.length === 0) return "whatever is here";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
