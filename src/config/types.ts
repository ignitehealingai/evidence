// Configuration types for a user profile.
//
// Evidence is currently a personal prototype (SK's profile lives in
// defaultProfile.ts), but every label, intervention, support contact, and
// evidence category flows through this Profile shape so a future version can
// load per-user configuration from storage or a backend instead.

export type Option = {
  id: string;
  label: string;
};

export type OptionGroup = {
  id: string;
  label: string;
  options: Option[];
};

export type Intervention = {
  id: string;
  label: string;
};

/** A group of suggested actions, e.g. quick ones vs. ones needing more time. */
export type InterventionGroup = {
  id: string;
  label: string;
  interventions: Intervention[];
};

export type EvidenceCategory = {
  id: string;
  label: string;
};

export type EvidenceExample = {
  text: string;
  /** EvidenceCategory id this example belongs to. */
  category: string;
};

export type SupportContact = {
  id: string;
  name: string;
  /** Optional phone number; can also be set in-app and stored locally. */
  phone?: string;
  methods: ("text" | "call")[];
};

export type BigDecisionBranch = {
  title: string;
  helper: string;
  prompts: string[];
};

export type BigDecisionConfig = {
  intro: string;
  question: string;
  branches: {
    yes: BigDecisionBranch;
    maybe: BigDecisionBranch;
    no: BigDecisionBranch;
  };
  specialPrompt: string;
};

export type Profile = {
  appName: string;
  tagline: string;
  corePromise: string[];
  /** Check-in screen 1: What do you want to do right now? (up to three) */
  urges: Option[];
  /**
   * Optional reminder shown on the pause screen when a specific urge was
   * selected (urge id -> line).
   */
  urgeReminders?: Record<string, string>;
  /** Check-in screen 2: What is happening in your body? */
  bodySensations: Option[];
  /** Check-in screen 3: How are you feeling? */
  feelings: Option[];
  /** Check-in screen 4: What else is going on? (dysregulators) */
  dysregulatorGroups: OptionGroup[];
  /** Shown between the check-in and the suggestions. */
  pauseMessage: string[];
  /** Suggested actions, grouped by how much time they take. */
  interventionGroups: InterventionGroup[];
  reflectionOutcomes: Option[];
  /** Shown on the reflection screen when "I acted on it" is selected. */
  actedOnIt: {
    title: string;
    lines: string[];
  };
  evidenceCategories: EvidenceCategory[];
  evidenceExamples: EvidenceExample[];
  supportContacts: SupportContact[];
  meetingListUrl: string;
  prayer: string[];
  bigDecision: BigDecisionConfig;
};
