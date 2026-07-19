import { defaultProfile } from "./defaultProfile";
import type { Profile } from "./types";

/**
 * Returns the active profile. For the prototype this is always SK's default
 * profile; later this is the seam where per-user configuration (stored
 * locally or in Supabase) gets loaded and merged.
 */
export function getProfile(): Profile {
  return defaultProfile;
}

/**
 * Looks up the display label for any option id used in the check-in flow
 * (feelings, dysregulators, body sensations, urges).
 */
export function optionLabel(profile: Profile, id: string): string {
  const pools = [
    profile.feelings,
    profile.bodySensations,
    profile.urges,
    ...profile.dysregulatorGroups.map((g) => g.options),
  ];
  for (const pool of pools) {
    const match = pool.find((o) => o.id === id);
    if (match) return match.label;
  }
  return id;
}

export function evidenceCategoryLabel(profile: Profile, id: string): string {
  return profile.evidenceCategories.find((c) => c.id === id)?.label ?? id;
}

/** Looks up the display label for an intervention (suggested action) id. */
export function interventionLabel(profile: Profile, id: string): string {
  for (const group of profile.interventionGroups) {
    const match = group.interventions.find((i) => i.id === id);
    if (match) return match.label;
  }
  return id;
}
