"use client";

import { useEffect, useMemo, useState } from "react";
import { getProfile } from "@/config";
import type { InterventionCategory } from "@/config/types";
import { recommendCategories } from "@/lib/engine";
import { addEntry, addSession, nowIso } from "@/lib/storage";
import { Button, ChipGrid, Screen, SectionLabel, StepDots } from "@/components/ui";

type Step =
  | "feelings"
  | "context"
  | "body"
  | "urge"
  | "pause"
  | "try"
  | "reflect"
  | "done";

const STEP_ORDER: Step[] = [
  "feelings",
  "context",
  "body",
  "urge",
  "pause",
  "try",
  "reflect",
  "done",
];

const TIMER_SECONDS = 10 * 60;

export default function IntensityFlow() {
  const profile = getProfile();

  const [step, setStep] = useState<Step>("feelings");
  const [startedAt] = useState(() => nowIso());

  const [feelings, setFeelings] = useState<string[]>([]);
  const [context, setContext] = useState<string[]>([]);
  const [body, setBody] = useState<string[]>([]);
  const [urge, setUrge] = useState<string[]>([]);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [interventionId, setInterventionId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceCategory, setEvidenceCategory] = useState("other");

  const allTags = useMemo(
    () => [...feelings, ...context, ...body, ...urge],
    [feelings, context, body, urge]
  );

  const recommendations = useMemo(
    () => recommendCategories(profile, allTags),
    [profile, allTags]
  );

  const category: InterventionCategory | undefined =
    profile.interventionCategories.find((c) => c.id === categoryId);

  // Countdown for "try one thing for 10 minutes".
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  function chooseCategory(id: string) {
    setCategoryId(id);
    setInterventionId(null);
    setSecondsLeft(null);
    setStep("try");
  }

  function goBack() {
    switch (step) {
      case "context":
        setStep("feelings");
        break;
      case "body":
        setStep("context");
        break;
      case "urge":
        setStep("body");
        break;
      case "pause":
        setStep("urge");
        break;
      case "try":
        setStep("pause");
        break;
      case "reflect":
        setStep(categoryId ? "try" : "pause");
        break;
    }
  }

  function finish() {
    addSession({
      startedAt,
      completedAt: nowIso(),
      feelings,
      dysregulators: context,
      body,
      urge: urge[0],
      categoryId: categoryId ?? undefined,
      interventionId: interventionId ?? undefined,
      outcomes,
    });
    for (const text of selectedExamples) {
      const example = profile.evidenceExamples.find((e) => e.text === text);
      addEntry({
        text,
        category: example?.category ?? "other",
        source: "reflection",
      });
    }
    if (evidenceText.trim()) {
      addEntry({
        text: evidenceText.trim(),
        category: evidenceCategory,
        source: "reflection",
      });
    }
    setStep("done");
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <Screen
      title={step === "done" ? undefined : "I need intensity"}
      back={step === "feelings" ? "/" : null}
      onBack={
        step !== "feelings" && step !== "done" ? goBack : undefined
      }
    >
      {step !== "done" && <StepDots step={stepIndex + 1} total={7} />}

      {step === "feelings" && (
        <SelectStep
          title="What is happening right now?"
          subtitle="Select all that apply. There are no wrong answers."
          onNext={() => setStep("context")}
        >
          <ChipGrid
            options={profile.feelings}
            selected={feelings}
            onChange={setFeelings}
          />
        </SelectStep>
      )}

      {step === "context" && (
        <SelectStep
          title="What else is going on?"
          subtitle="This is pattern recognition, not analysis."
          onNext={() => setStep("body")}
        >
          {profile.dysregulatorGroups.map((group) => (
            <div key={group.id}>
              <SectionLabel>{group.label}</SectionLabel>
              <ChipGrid
                options={group.options}
                selected={context}
                onChange={setContext}
              />
            </div>
          ))}
        </SelectStep>
      )}

      {step === "body" && (
        <SelectStep
          title="What is happening in your body?"
          subtitle="Select all that apply."
          onNext={() => setStep("urge")}
        >
          <ChipGrid
            options={profile.bodySensations}
            selected={body}
            onChange={setBody}
          />
        </SelectStep>
      )}

      {step === "urge" && (
        <SelectStep
          title="What do you want to do right now?"
          subtitle="Select one. Naming it is not doing it."
          onNext={() => setStep("pause")}
        >
          <ChipGrid
            options={profile.urges}
            selected={urge}
            onChange={setUrge}
            single
          />
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
          <SectionLabel>Start here</SectionLabel>
          <div className="space-y-3">
            {recommendations.map(({ category: rec }) => (
              <button
                key={rec.id}
                type="button"
                onClick={() => chooseCategory(rec.id)}
                className="block w-full rounded-2xl border border-line bg-surface px-5 py-4 text-left transition active:bg-line"
              >
                <span className="block text-base font-semibold text-glow">
                  {rec.name}
                </span>
                <span className="mt-1 block text-sm text-fog">
                  for when you&rsquo;re {rec.useWhen.slice(0, 3).join(", ")}
                </span>
              </button>
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-fog">
              Show all categories
            </summary>
            <div className="mt-3 space-y-2">
              {profile.interventionCategories
                .filter((c) => !recommendations.some((r) => r.category.id === c.id))
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => chooseCategory(c.id)}
                    className="block w-full rounded-2xl border border-line bg-surface px-5 py-3 text-left text-sm text-mist transition active:bg-line"
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          </details>
          <div className="mt-6">
            <Button variant="ghost" onClick={() => setStep("reflect")}>
              Skip straight to reflection
            </Button>
          </div>
        </div>
      )}

      {step === "try" && category && (
        <div className="flex flex-1 flex-col">
          <h2 className="text-2xl font-semibold text-mist">{category.name}</h2>
          {category.prompt && (
            <p className="mt-3 rounded-2xl border border-glow/40 bg-glow/10 px-4 py-3 text-sm text-glow">
              {category.prompt}
            </p>
          )}
          <SectionLabel>Try one thing</SectionLabel>
          <ChipGrid
            options={category.interventions}
            selected={interventionId ? [interventionId] : []}
            onChange={(ids) => setInterventionId(ids[0] ?? null)}
            single
          />
          {category.ask && category.ask.length > 0 && (
            <>
              <SectionLabel>Ask yourself</SectionLabel>
              <ul className="space-y-1.5 text-sm text-mist">
                {category.ask.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </>
          )}
          {category.reminder && (
            <p className="mt-4 text-center text-sm font-medium text-calm">
              {category.reminder}
            </p>
          )}

          <div className="mt-6 space-y-3">
            {secondsLeft === null ? (
              <Button variant="soft" onClick={() => setSecondsLeft(TIMER_SECONDS)}>
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
            <Button onClick={() => setStep("reflect")}>
              I tried it — reflect
            </Button>
            <Button variant="ghost" onClick={() => setStep("pause")}>
              Pick a different category
            </Button>
          </div>
        </div>
      )}

      {step === "reflect" && (
        <div className="flex flex-1 flex-col">
          <h2 className="text-2xl font-semibold text-mist">What happened?</h2>
          <div className="mt-4">
            <ChipGrid
              options={profile.reflectionOutcomes}
              selected={outcomes}
              onChange={setOutcomes}
            />
          </div>
          {outcomes.includes("acted-on-it") && (
            <p className="mt-4 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-mist">
              You noticed, and you came back to log it. That honesty is
              evidence too.
            </p>
          )}

          <SectionLabel>
            Evidence that I&rsquo;m changing
          </SectionLabel>
          <p className="mb-2 text-xs text-fog">
            Tap everything that&rsquo;s true. More than one counts.
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.evidenceExamples.map((example) => {
              const on = selectedExamples.includes(example.text);
              return (
                <button
                  key={example.text}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setSelectedExamples((prev) =>
                      on
                        ? prev.filter((t) => t !== example.text)
                        : [...prev, example.text]
                    )
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
            value={evidenceText}
            onChange={(e) => setEvidenceText(e.target.value)}
            placeholder="What else did you do differently?"
            rows={2}
            className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-mist placeholder:text-fog/60 focus:border-glow focus:outline-none"
          />

          {evidenceText.trim() && (
            <>
              <SectionLabel>Count it as</SectionLabel>
              <ChipGrid
                options={profile.evidenceCategories.map((c) => ({
                  id: c.id,
                  label: c.label,
                }))}
                selected={[evidenceCategory]}
                onChange={(ids) => setEvidenceCategory(ids[0] ?? "other")}
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

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
