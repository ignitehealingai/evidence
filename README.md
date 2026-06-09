# Evidence

> When I feel the urge for intensity, help me find the need underneath it and show me evidence that I'm changing.

A mobile-first recovery and nervous-system regulation app for people with addiction, ADHD, Complex PTSD, and intensity-seeking behaviors. The goal is not to eliminate intensity — it's to redirect intensity toward aliveness, integrity, repair, and growth.

## Core promise

You do not have to decide right now. Pause. Notice. Choose one next step. Collect evidence.

## MVP features

- **I Need Intensity flow** (`/intensity`) — a guided check-in: what's happening, what else is going on (dysregulators), what's happening in your body, what you want to do — followed by a pause and a recommended regulation intervention, an optional 10-minute timer, and a reflection that logs evidence.
- **Dysregulator tracking** — every check-in records dysregulators; the dashboard shows your most common ones.
- **Intervention engine** (`src/lib/engine.ts`) — matches what you selected to intervention categories (Stimulation, Relief, Permission, Anger, Arousal, Creativity, Connection, Gratitude, Memory & Reality Check, Transformation).
- **Evidence logging** (`/log-win`) — log any win, any size, with one-tap example chips.
- **Evidence dashboard** (`/evidence`) — "Proof I'm Changing": counts by category, recent evidence, common dysregulators. No streaks by default — evidence over perfection.
- **Support screen** (`/support`) — text/call support contacts (numbers are entered in-app and stay on-device), meeting list, prayer. Reaching out is logged as evidence.
- **Big Decision Mode** (`/decision`) — "Have I already decided?" with process/explore/evaluate branches and the special prompt: *Am I protecting my autonomy? Or protecting access to a behavior?* Delaying a decision counts as evidence.

## Design principles

1. **No shame.** The app never says "you failed" or "you relapsed." It says: you noticed, you paused, you came back, evidence counts.
2. **Regulation before analysis.** The user needs regulation first; understanding can come later.
3. **Permission is not action.** Feeling something is allowed without acting on it.
4. **Evidence over perfection.**

## Architecture

- **Next.js (App Router) + React + Tailwind CSS**, mobile-first.
- **Local-first storage**: everything lives in `localStorage` (`src/lib/storage.ts`). This is the single seam where Supabase cloud sync gets added later.
- **Config-driven personalization**: this build is a personal prototype for SK, but all labels, feelings, dysregulators, body sensations, urges, interventions, support contacts, evidence categories, examples, and Big Decision prompts live in `src/config/defaultProfile.ts` behind the `Profile` type (`src/config/types.ts`). Generalizing for coaching clients and Ignite Healing AI means loading a different profile through `getProfile()` in `src/config/index.ts` — no UI changes required.

```
src/
  config/        # Profile type + SK's default profile (all customizable content)
  lib/           # storage (local-first), regulation engine, dashboard stats
  components/    # shared UI (Screen, ChipGrid, Button, ...)
  app/           # routes: / intensity evidence log-win support decision
```

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Roadmap (post-MVP)

- Supabase cloud sync (storage layer is already isolated)
- Per-user profiles for coaching clients
- Monthly analytics review (top dysregulators, most effective interventions, evidence trends)
- iOS / Android
