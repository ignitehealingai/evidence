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

export type InterventionCategory = {
  id: string;
  name: string;
  /** Short "use when" summary shown on the category card. */
  useWhen: string[];
  /**
   * Option ids (from feelings, dysregulators, body sensations, and urges)
   * that make this category a good match. Used by the regulation engine.
   */
  matchTags: string[];
  interventions: Intervention[];
  /** Optional fill-in prompt shown above the interventions (e.g. Permission). */
  prompt?: string;
  /** Optional questions to sit with during or after the intervention. */
  ask?: string[];
  /** Optional closing reminder (e.g. "Arousal is allowed."). */
  reminder?: string;
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
  /** Step 2: What is happening right now? */
  feelings: Option[];
  /** Step 3: What else is going on? (dysregulators) */
  dysregulatorGroups: OptionGroup[];
  /** Step 4: What is happening in your body? */
  bodySensations: Option[];
  /** Step 5: What do you want to do right now? */
  urges: Option[];
  /** Shown between the check-in and the intervention. */
  pauseMessage: string[];
  interventionCategories: InterventionCategory[];
  /** Category ids to suggest when nothing matches. */
  fallbackCategoryIds: string[];
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
