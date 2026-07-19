import type { Profile } from "./types";

// SK's personal profile. This is the prototype configuration; when Evidence
// is generalized for coaching clients and Ignite Healing AI, profiles like
// this one will be created per user (names like Anthony, Cheryl, and Sunny
// below are SK-specific and intentionally live here, not in the UI code).

export const defaultProfile: Profile = {
  appName: "Evidence",
  tagline:
    "When I feel the urge for intensity, help me find the need underneath it and show me evidence that I'm changing.",

  corePromise: [
    "You do not have to decide right now.",
    "Pause.",
    "Notice.",
    "Choose one next step.",
    "Collect evidence.",
  ],

  urges: [
    { id: "get-high", label: "get high" },
    { id: "spend-money", label: "spend money" },
    { id: "sleep", label: "sleep" },
    { id: "orgasm", label: "orgasm" },
    { id: "flirt", label: "flirt" },
    { id: "human-touch", label: "human touch" },
    { id: "text-someone", label: "text someone" },
    { id: "write", label: "write" },
    { id: "give-in-boundary", label: "give in on a boundary" },
    { id: "disappear", label: "disappear" },
    { id: "dont-know", label: "don't know" },
  ],

  urgeReminders: {
    "give-in-boundary":
      "I can feel how much she hates this — and how much I hate her being upset — without rescuing either of us from it.",
  },

  bodySensations: [
    { id: "adrenaline", label: "adrenaline pumping" },
    { id: "nervous-stomach", label: "stomach pain" },
    { id: "throw-up", label: "throw up" },
    { id: "buzzing", label: "buzzing" },
    { id: "numb", label: "numb" },
    { id: "empty", label: "empty" },
    { id: "ruminating", label: "obsessive thinking / ruminating" },
    { id: "eye-twitching", label: "eye twitching" },
    { id: "tight-chest", label: "tight chest" },
    { id: "racing-thoughts", label: "racing thoughts" },
    { id: "cant-sit-still", label: "can't sit still" },
    { id: "exhausted", label: "exhausted" },
    { id: "body-pressure", label: "pressure in body" },
    { id: "stomach-knot", label: "knot in stomach" },
    { id: "heavy-body", label: "heavy body" },
    { id: "dont-know", label: "don't know" },
  ],

  feelings: [
    { id: "bored", label: "bored" },
    { id: "lonely", label: "lonely" },
    { id: "overwhelmed", label: "overwhelmed" },
    { id: "angry", label: "angry" },
    { id: "aroused", label: "aroused" },
    { id: "sad", label: "sad" },
    { id: "grief", label: "grief" },
    { id: "stuck", label: "stuck" },
    { id: "excited", label: "excited" },
    { id: "activated", label: "activated" },
    { id: "ashamed", label: "ashamed" },
    { id: "anxious", label: "anxious" },
    { id: "rejected", label: "rejected" },
    { id: "disappointed", label: "disappointed" },
    { id: "deserve-reward", label: "I worked hard — I deserve to take it easy" },
    { id: "want-to-feel-good", label: "I want to feel good" },
    { id: "want-escape", label: "I want to escape" },
    { id: "urge-fix", label: "urge to fix something" },
    { id: "urge-use", label: "urge to use" },
    { id: "dont-know", label: "don't know" },
  ],

  dysregulatorGroups: [
    {
      id: "physical",
      label: "Physical",
      options: [
        { id: "hungry", label: "hungry" },
        { id: "thirsty", label: "thirsty" },
        { id: "tired", label: "tired" },
        { id: "sick", label: "sick" },
        { id: "pain", label: "pain" },
        { id: "no-movement", label: "haven't moved my body" },
        { id: "forgot-medication", label: "forgot medication" },
        { id: "menstruating", label: "menstruating" },
      ],
    },
    {
      id: "life-stressors",
      label: "Life Stressors",
      options: [
        { id: "kid-stress", label: "kids" },
        { id: "co-parent-stress", label: "co-parent" },
        { id: "ex-stress", label: "ex" },
        { id: "work-stress", label: "work" },
        { id: "money-stress", label: "money" },
        { id: "parents", label: "parents" },
        { id: "adulting", label: "adulting" },
        { id: "decision-fatigue", label: "decision fatigue" },
        { id: "uncertainty", label: "uncertainty" },
      ],
    },
  ],

  pauseMessage: [
    "You do not need to understand this yet.",
    "You only need to pause.",
    "Try one thing for 10 minutes.",
  ],

  interventionGroups: [
    {
      id: "quick",
      label: "Quick — even while working",
      interventions: [
        { id: "sing", label: "sing" },
        { id: "dance", label: "dance" },
        { id: "three-breaths", label: "3 breaths" },
        { id: "meditate", label: "meditate" },
        { id: "sunny-snuggles", label: "Sunny snuggles" },
        { id: "text-friend", label: "text a friend" },
        { id: "list-3-gratitudes", label: "list 3 gratitudes" },
        { id: "text-coach", label: "text my coach" },
        { id: "sour-candy", label: "sour candy" },
        { id: "lollipop", label: "suck on a lollipop" },
        { id: "sparkling-water", label: "drink sparkling water" },
        { id: "straw", label: "drink through a straw" },
        { id: "chew-gum", label: "chew gum" },
        { id: "prayer", label: "prayer" },
        { id: "morning-pages", label: "write morning pages" },
        { id: "photos-last-year", label: "look at photos from this day last year" },
        { id: "review-evidence", label: "review evidence" },
        { id: "compare-six-months", label: "compare today to six months ago" },
        { id: "read-wins", label: "read wins" },
      ],
    },
    {
      id: "more-time",
      label: "If you have more time",
      interventions: [
        { id: "play-bass", label: "play bass" },
        { id: "lift-weights", label: "lift weights" },
        { id: "cold-shower", label: "cold shower" },
        { id: "hot-shower", label: "hot shower" },
        { id: "walk-sunny", label: "walk Sunny" },
        { id: "go-outside", label: "go outside" },
        { id: "lie-down", label: "lie down" },
        { id: "nap", label: "take a nap" },
        { id: "fast-walk", label: "fast walk" },
        { id: "bike-ride", label: "bike ride" },
        { id: "stomp", label: "stomp" },
        { id: "pillow-hit", label: "hit pillow or punching bag" },
        { id: "sober-sprint", label: "15-minute sober writing sprint" },
        { id: "call-sponsor", label: "call my sponsor" },
        { id: "spicy-food", label: "spicy food" },
      ],
    },
  ],

  reflectionOutcomes: [
    { id: "craving-passed", label: "craving passed" },
    { id: "craving-decreased", label: "craving decreased" },
    { id: "craving-stayed", label: "craving stayed" },
    { id: "acted-on-it", label: "I acted on it" },
    { id: "paused", label: "I paused" },
    { id: "reached-out", label: "I reached out" },
    { id: "learned-something", label: "I learned something" },
    { id: "still-dont-know", label: "I still don't know" },
  ],

  actedOnIt: {
    title: "No shame spiral. Not tonight.",
    lines: [
      "The old pattern was: act, hide, spiral, repeat. You are already breaking it — you came back and you told the truth.",
      "Nothing resets. Every pause, every honest moment, every reach-out you've ever logged still counts. Caving can't subtract from any of it.",
      "This is information, not a verdict. Look at what you checked on the way in — tired? isolated? skipped meds? That's the thing to tend to, not a reason to punish yourself.",
      "Shortening the distance between the slip and the honesty IS the change. You're doing it right now.",
      "One next right thing: drink some water, text Anthony, rest. You can choose it from here.",
    ],
  },

  evidenceCategories: [
    { id: "pause", label: "Pauses" },
    { id: "gratitude", label: "Gratitudes" },
    { id: "support", label: "Support reach-outs" },
    { id: "craving-survived", label: "Cravings survived" },
    { id: "honest-moment", label: "Honest moments" },
    { id: "parenting-win", label: "Parenting wins" },
    { id: "recovery-win", label: "Recovery wins" },
    { id: "boundary-held", label: "Boundaries held" },
    { id: "difficult-conversation", label: "Difficult conversations" },
    { id: "meeting-attended", label: "Meetings attended" },
    { id: "repair", label: "Acts of repair" },
    { id: "sober-creative", label: "Sober creative sessions" },
    { id: "decision-delayed", label: "Decisions delayed" },
    { id: "other", label: "Other evidence" },
  ],

  evidenceExamples: [
    { text: "I paused.", category: "pause" },
    { text: "I waited 10 minutes.", category: "pause" },
    { text: "Craving survived.", category: "craving-survived" },
    { text: "I told the truth.", category: "honest-moment" },
    { text: "I texted Anthony.", category: "support" },
    { text: "Asked for help.", category: "support" },
    { text: "I noticed the pattern.", category: "other" },
    { text: "Delayed a big decision.", category: "decision-delayed" },
    { text: "I let myself feel without acting.", category: "recovery-win" },
    { text: "I came back.", category: "recovery-win" },
    { text: "Boundary held.", category: "boundary-held" },
    { text: "Asked for what I needed.", category: "boundary-held" },
    { text: "Parenting win.", category: "parenting-win" },
    { text: "Recovery win.", category: "recovery-win" },
    { text: "I apologized.", category: "repair" },
    { text: "Honest conversation.", category: "difficult-conversation" },
    { text: "Attended a meeting.", category: "meeting-attended" },
    { text: "Made amends.", category: "repair" },
    { text: "Chose repair over avoidance.", category: "repair" },
    { text: "Finished a hard task.", category: "other" },
    { text: "Took medication.", category: "recovery-win" },
    { text: "Exercised.", category: "recovery-win" },
    { text: "Ate a meal.", category: "recovery-win" },
    { text: "Chose rest.", category: "recovery-win" },
    { text: "Stayed present with discomfort.", category: "recovery-win" },
    { text: "Followed through on a commitment.", category: "other" },
    {
      text: "Did something sober that I thought I needed a substance to do.",
      category: "sober-creative",
    },
    {
      text: "Let someone influence me without losing myself.",
      category: "other",
    },
  ],

  supportContacts: [
    {
      id: "anthony",
      name: "Anthony",
      phone: "781-706-4853",
      methods: ["text", "call"],
    },
    {
      id: "cheryl",
      name: "Cheryl",
      phone: "336-404-5959",
      methods: ["text", "call"],
    },
    { id: "trusted-friend", name: "Trusted Friend", methods: ["call"] },
  ],

  meetingListUrl: "https://www.aa.org/find-aa",

  prayer: [
    "Help me be honest.",
    "Help me pause.",
    "Help me choose the next right thing.",
  ],

  bigDecision: {
    intro: "You do not have to decide right now.",
    question: "Have I already decided?",
    branches: {
      yes: {
        title: "It sounds like the decision is made.",
        helper: "Let's process it before you act on it.",
        prompts: [
          "What does this decision move me toward?",
          "What does it help me avoid?",
          "Who will this affect, and have I talked to them?",
          "What would it cost me to act on this in 24 hours instead of right now?",
        ],
      },
      maybe: {
        title: "You're still exploring.",
        helper: "Let's get curious about what's underneath it.",
        prompts: [
          "What am I hoping this changes?",
          "What need is underneath this decision?",
          "What is the smallest version of this I could try first?",
          "Whose voice do I trust on this? What would they ask me?",
        ],
      },
      no: {
        title: "Nothing is decided yet.",
        helper: "Let's evaluate without pressure.",
        prompts: [
          "What are the real options, including \"not yet\"?",
          "What would future me, one year from now, thank me for?",
          "What evidence would help me decide?",
          "What happens if I wait a week?",
        ],
      },
    },
    specialPrompt:
      "Am I protecting my autonomy? Or protecting access to a behavior?",
  },
};
