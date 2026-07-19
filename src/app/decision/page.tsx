"use client";

import { useState } from "react";
import { getProfile } from "@/config";
import { addDecision, addEntry } from "@/lib/storage";
import { Button, Screen, SectionLabel } from "@/components/ui";

type Decided = "yes" | "maybe" | "no";
type Step = "what" | "decided" | "process" | "done";

export default function BigDecisionMode() {
  const profile = getProfile();
  const config = profile.bigDecision;

  const [step, setStep] = useState<Step>("what");
  const [decision, setDecision] = useState("");
  const [decided, setDecided] = useState<Decided | null>(null);
  const [notes, setNotes] = useState("");
  const [delayed, setDelayed] = useState(false);

  const branch = decided ? config.branches[decided] : null;

  function goBack() {
    if (step === "decided") setStep("what");
    if (step === "process") setStep("decided");
  }

  function save(withDelay: boolean) {
    if (!decided) return;
    addDecision({
      decision: decision.trim(),
      decided,
      notes: notes.trim(),
      delayed: withDelay,
    });
    if (withDelay) {
      addEntry({
        text: decision.trim()
          ? `Delayed a big decision: ${decision.trim()}`
          : "Delayed a big decision.",
        category: "decision-delayed",
        source: "decision",
      });
    }
    setDelayed(withDelay);
    setStep("done");
  }

  return (
    <Screen
      title="Big Decisions"
      back={step === "what" ? "/" : null}
      onBack={
        step === "decided" || step === "process" ? goBack : undefined
      }
    >
      {step === "what" && (
        <div className="flex flex-1 flex-col">
          <p className="mb-1 text-lg font-medium text-mist">{config.intro}</p>
          <p className="mb-5 text-sm text-fog">
            Tattoos, purchases, relationships, job changes, quitting,
            starting — anything big.
          </p>
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="What is the decision?"
            rows={3}
            autoFocus
            className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-mist placeholder:text-fog/60 focus:border-glow focus:outline-none"
          />
          <div className="mt-6">
            <Button onClick={() => setStep("decided")} disabled={!decision.trim()}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "decided" && (
        <div className="flex flex-1 flex-col">
          <h2 className="mb-5 text-2xl font-semibold text-mist">
            {config.question}
          </h2>
          <div className="space-y-3">
            {(["yes", "maybe", "no"] as const).map((option) => (
              <Button
                key={option}
                variant="soft"
                onClick={() => {
                  setDecided(option);
                  setStep("process");
                }}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === "process" && branch && (
        <div className="flex flex-1 flex-col">
          <h2 className="text-xl font-semibold text-mist">{branch.title}</h2>
          <p className="mt-1 text-sm text-fog">{branch.helper}</p>

          <SectionLabel>Sit with these</SectionLabel>
          <ul className="space-y-2">
            {branch.prompts.map((prompt) => (
              <li
                key={prompt}
                className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-mist"
              >
                {prompt}
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-2xl border border-glow/40 bg-glow/10 px-4 py-3 text-sm font-medium text-glow">
            {config.specialPrompt}
          </p>

          <SectionLabel>Notes (optional)</SectionLabel>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What came up?"
            rows={3}
            className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-mist placeholder:text-fog/60 focus:border-glow focus:outline-none"
          />

          <div className="mt-6 space-y-3">
            <Button onClick={() => save(true)}>
              Delay this decision for now
            </Button>
            <Button variant="soft" onClick={() => save(false)}>
              Save and step away
            </Button>
            <Button variant="ghost" href="/intensity">
              I&rsquo;m activated — regulate first
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          {delayed ? (
            <>
              <p className="text-3xl font-semibold text-glow">
                You didn&rsquo;t decide while activated.
              </p>
              <p className="text-sm text-fog">
                That&rsquo;s evidence. It&rsquo;s on your dashboard.
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-semibold text-glow">Saved.</p>
              <p className="text-sm text-fog">
                The decision will still be there when you&rsquo;re regulated.
              </p>
            </>
          )}
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
