// Record types persisted by the local-first storage layer.

export type EvidenceSource = "win" | "reflection" | "support" | "decision";

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
  urge?: string;
  /** Intervention category and intervention the user chose, if any. */
  categoryId?: string;
  interventionId?: string;
  /** Reflection outcome ids. */
  outcomes: string[];
};

export type DecisionEntry = {
  id: string;
  createdAt: string;
  decision: string;
  decided: "yes" | "maybe" | "no";
  notes: string;
  delayed: boolean;
};
