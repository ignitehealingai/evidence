// Local-first storage backed by localStorage.
//
// Everything the user logs stays on their device. When cloud sync (Supabase)
// is added later, this module is the only place that needs to learn about it.
//
// Reads are cached and exposed to React through useSyncExternalStore hooks so
// components re-render when something is logged, without setState-in-effect.

import { useSyncExternalStore } from "react";
import type {
  CheckInDraft,
  DecisionEntry,
  EvidenceEntry,
  IntensitySession,
} from "./types";

const KEYS = {
  entries: "evidence.entries.v1",
  sessions: "evidence.sessions.v1",
  decisions: "evidence.decisions.v1",
  contacts: "evidence.contacts.v1",
  draft: "evidence.draft.v1",
  winDraft: "evidence.windraft.v1",
} as const;

export function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Storage full or unavailable; the app keeps working without persistence.
  }
}

// Change notification ---------------------------------------------------------

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange(): void {
  for (const listener of listeners) listener();
}

const EMPTY: never[] = [];

// Evidence entries -----------------------------------------------------------

let entriesCache: EvidenceEntry[] | null = null;

export function getEntries(): EvidenceEntry[] {
  return (entriesCache ??= readList<EvidenceEntry>(KEYS.entries));
}

export function addEntry(
  partial: Omit<EvidenceEntry, "id" | "createdAt">
): EvidenceEntry {
  const entry: EvidenceEntry = { id: newId(), createdAt: nowIso(), ...partial };
  entriesCache = [entry, ...getEntries()];
  writeList(KEYS.entries, entriesCache);
  emitChange();
  return entry;
}

export function updateEntry(
  id: string,
  changes: Partial<Pick<EvidenceEntry, "text" | "category">>
): void {
  entriesCache = getEntries().map((e) =>
    e.id === id ? { ...e, ...changes } : e
  );
  writeList(KEYS.entries, entriesCache);
  emitChange();
}

export function deleteEntry(id: string): void {
  entriesCache = getEntries().filter((e) => e.id !== id);
  writeList(KEYS.entries, entriesCache);
  emitChange();
}

export function useEntries(): EvidenceEntry[] {
  return useSyncExternalStore(subscribe, getEntries, () => EMPTY);
}

// Intensity sessions ---------------------------------------------------------

let sessionsCache: IntensitySession[] | null = null;

export function getSessions(): IntensitySession[] {
  return (sessionsCache ??= readList<IntensitySession>(KEYS.sessions));
}

export function addSession(
  partial: Omit<IntensitySession, "id">
): IntensitySession {
  const session: IntensitySession = { id: newId(), ...partial };
  sessionsCache = [session, ...getSessions()];
  writeList(KEYS.sessions, sessionsCache);
  emitChange();
  return session;
}

export function useSessions(): IntensitySession[] {
  return useSyncExternalStore(subscribe, getSessions, () => EMPTY);
}

// Big decisions ---------------------------------------------------------------

let decisionsCache: DecisionEntry[] | null = null;

export function getDecisions(): DecisionEntry[] {
  return (decisionsCache ??= readList<DecisionEntry>(KEYS.decisions));
}

export function addDecision(
  partial: Omit<DecisionEntry, "id" | "createdAt">
): DecisionEntry {
  const decision: DecisionEntry = {
    id: newId(),
    createdAt: nowIso(),
    ...partial,
  };
  decisionsCache = [decision, ...getDecisions()];
  writeList(KEYS.decisions, decisionsCache);
  emitChange();
  return decision;
}

// Support contact phone overrides ---------------------------------------------
// Phone numbers are personal, so they are entered in-app and kept on-device
// rather than committed to the profile config.

export type ContactPhones = Record<string, string>;

const EMPTY_PHONES: ContactPhones = {};

let phonesCache: ContactPhones | null = null;

function readContactPhones(): ContactPhones {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEYS.contacts);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as ContactPhones) : {};
  } catch {
    return {};
  }
}

export function getContactPhones(): ContactPhones {
  return (phonesCache ??= readContactPhones());
}

export function setContactPhone(contactId: string, phone: string): void {
  const phones = { ...getContactPhones() };
  if (phone.trim()) {
    phones[contactId] = phone.trim();
  } else {
    delete phones[contactId];
  }
  phonesCache = phones;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEYS.contacts, JSON.stringify(phones));
    } catch {
      // Non-fatal.
    }
  }
  emitChange();
}

export function useContactPhones(): ContactPhones {
  return useSyncExternalStore(subscribe, getContactPhones, () => EMPTY_PHONES);
}

// In-progress check-in draft ---------------------------------------------------
// Saved after every tap so closing the app mid-check-in loses nothing.

let draftCache: CheckInDraft | null | undefined;

function readObject<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeObject<T>(key: string, value: T | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Non-fatal.
  }
}

export function getDraft(): CheckInDraft | null {
  if (draftCache === undefined) draftCache = readObject<CheckInDraft>(KEYS.draft);
  return draftCache;
}

export function saveDraft(draft: CheckInDraft): void {
  draftCache = draft;
  writeObject(KEYS.draft, draft);
  emitChange();
}

export function clearDraft(): void {
  draftCache = null;
  writeObject(KEYS.draft, null);
  emitChange();
}

export function useDraft(): CheckInDraft | null {
  return useSyncExternalStore(subscribe, getDraft, () => null);
}

// Log-a-Win draft --------------------------------------------------------------
// A typed-but-unsaved win survives closing the app.

export type WinDraft = { text: string; category: string };

let winDraftCache: WinDraft | null | undefined;

export function getWinDraft(): WinDraft | null {
  if (winDraftCache === undefined) {
    winDraftCache = readObject<WinDraft>(KEYS.winDraft);
  }
  return winDraftCache;
}

export function saveWinDraft(draft: WinDraft): void {
  winDraftCache = draft;
  writeObject(KEYS.winDraft, draft);
  emitChange();
}

export function clearWinDraft(): void {
  winDraftCache = null;
  writeObject(KEYS.winDraft, null);
  emitChange();
}

export function useWinDraft(): WinDraft | null {
  return useSyncExternalStore(subscribe, getWinDraft, () => null);
}

// Reset ------------------------------------------------------------------------

/**
 * Erases all logged data (evidence, check-ins, decisions) from this device.
 * Contact phone numbers are kept.
 */
export function clearAllData(): void {
  entriesCache = [];
  sessionsCache = [];
  decisionsCache = [];
  draftCache = null;
  winDraftCache = null;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEYS.entries);
      window.localStorage.removeItem(KEYS.sessions);
      window.localStorage.removeItem(KEYS.decisions);
      window.localStorage.removeItem(KEYS.draft);
      window.localStorage.removeItem(KEYS.winDraft);
    } catch {
      // Non-fatal.
    }
  }
  emitChange();
}
