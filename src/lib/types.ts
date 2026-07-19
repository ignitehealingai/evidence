// Record types persisted by the local-first storage layer.

export type EvidenceSource =
  | "win"
  | "reflection"
  | "support"
  | "decision"
  | "gratitude";

export type EvidenceEntry = {
  id: string;
  createdAt: string; // ISO timestamp
  text: string;
  /** EvidenceCategory id from the profile config. */
  category: string;
  source: EvidenceSource;
};

export type IntensitySession = {
  id: string;
  startedAt: string;
  completedAt: string;
  /** Option ids selected in each step of the check-in. */
  feelings: string[];
  dysregulators: string[];
  body: string[];
  /** Selected urges (up to three). `urge` kept for entries from old versions. */
  urges?: string[];
  urge?: string;
  /** Legacy field from the category era. */
  categoryId?: string;
  /** The suggested action the user chose, if any. */
  interventionId?: string;
  /** Reflection outcome ids. */
  outcomes: string[];
};

/**
 * An in-progress check-in, persisted after every tap so nothing is lost if
 * the app is closed mid-flow. Restored automatically on next open.
 */
export type CheckInDraft = {
  step: "urge" | "body" | "feelings" | "context" | "pause" | "try" | "reflect";
  startedAt: string;
  urges: string[];
  body: string[];
  feelings: string[];
  dysregulators: string[];
  interventionId: string | null;
  outcomes: string[];
  selectedExamples: string[];
  evidenceText: string;
  evidenceCategory: string;
};

export type DecisionEntry = {
  id: string;
  createdAt: string;
  decision: string;
  decided: "yes" | "maybe" | "no";
  notes: string;
  delayed: boolean;
};
