// The regulation engine: maps what the user selected during the check-in to
// the intervention categories most likely to meet the need underneath.

import type { InterventionCategory, Profile } from "@/config/types";

export type Recommendation = {
  category: InterventionCategory;
  /** How many of the user's selections this category matched. */
  score: number;
};

export function recommendCategories(
  profile: Profile,
  selectedTagIds: string[],
  limit = 3
): Recommendation[] {
  const selected = new Set(selectedTagIds);

  const scored = profile.interventionCategories
    .map((category) => ({
      category,
      score: category.matchTags.filter((tag) => selected.has(tag)).length,
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const results = scored.slice(0, limit);

  // If nothing (or too little) matched — e.g. the user picked "don't know"
  // everywhere — fall back to gentle defaults rather than showing nothing.
  for (const fallbackId of profile.fallbackCategoryIds) {
    if (results.length >= limit) break;
    if (results.some((r) => r.category.id === fallbackId)) continue;
    const category = profile.interventionCategories.find(
      (c) => c.id === fallbackId
    );
    if (category) results.push({ category, score: 0 });
  }

  return results;
}
