"use client";

import { useState } from "react";
import { getProfile } from "@/config";
import type { SupportContact } from "@/config/types";
import { addEntry, setContactPhone, useContactPhones } from "@/lib/storage";
import { Button, Screen, SectionLabel } from "@/components/ui";

export default function Support() {
  const profile = getProfile();
  const storedPhones = useContactPhones();
  const [showPrayer, setShowPrayer] = useState(false);
  const [reachedOut, setReachedOut] = useState<string | null>(null);

  function phoneFor(contact: SupportContact): string | undefined {
    return storedPhones[contact.id] ?? contact.phone;
  }

  function logReachOut(contact: SupportContact) {
    addEntry({
      text: `Reached out to ${contact.name}`,
      category: "support",
      source: "support",
    });
    setReachedOut(contact.name);
  }

  function editNumber(contact: SupportContact) {
    const current = phoneFor(contact) ?? "";
    const next = window.prompt(
      `Phone number for ${contact.name}? (Stays on this device.)`,
      current
    );
    if (next === null) return;
    setContactPhone(contact.id, next);
  }

  return (
    <Screen title="Support" back="/">
      <p className="mb-5 text-sm text-fog">
        Reaching out is evidence. It counts even before they answer.
      </p>

      {reachedOut && (
        <p className="mb-4 rounded-2xl border border-calm/40 bg-calm/10 px-4 py-3 text-sm text-calm">
          You reached out to {reachedOut}. Logged as evidence.
        </p>
      )}

      <div className="space-y-3">
        {profile.supportContacts.map((contact) => {
          const phone = phoneFor(contact);
          return (
            <div
              key={contact.id}
              className="rounded-2xl border border-line bg-surface px-4 py-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-mist">{contact.name}</p>
                <button
                  type="button"
                  onClick={() => editNumber(contact)}
                  className="text-xs text-fog underline underline-offset-2"
                >
                  {phone ? "edit number" : "add number"}
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                {contact.methods.includes("text") && (
                  <ContactAction
                    label={`Text ${contact.name}`}
                    href={phone ? `sms:${phone}` : undefined}
                    onActivate={() =>
                      phone ? logReachOut(contact) : editNumber(contact)
                    }
                    primary
                  />
                )}
                {contact.methods.includes("call") && (
                  <ContactAction
                    label={`Call ${contact.name}`}
                    href={phone ? `tel:${phone}` : undefined}
                    onActivate={() =>
                      phone ? logReachOut(contact) : editNumber(contact)
                    }
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        <a
          href={profile.meetingListUrl}
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-2xl border border-line bg-surface px-5 py-4 text-center text-base font-medium text-mist transition active:bg-line"
        >
          Open meeting list
        </a>
        <Button variant="soft" onClick={() => setShowPrayer((s) => !s)}>
          Pray
        </Button>
      </div>

      {showPrayer && (
        <div className="mt-5 space-y-1.5 rounded-2xl border border-line bg-surface px-5 py-6 text-center">
          {profile.prayer.map((line) => (
            <p key={line} className="text-base text-mist">
              {line}
            </p>
          ))}
        </div>
      )}

      <SectionLabel>If you only do one thing</SectionLabel>
      <p className="text-sm text-fog">
        You don&rsquo;t have to explain anything. &ldquo;Hey, rough moment, can
        you talk?&rdquo; is enough.
      </p>
    </Screen>
  );
}

function ContactAction({
  label,
  href,
  onActivate,
  primary = false,
}: {
  label: string;
  href?: string;
  onActivate: () => void;
  primary?: boolean;
}) {
  const className = primary
    ? "flex-1 rounded-xl bg-glow px-4 py-3 text-center text-sm font-semibold text-night transition active:scale-[0.99]"
    : "flex-1 rounded-xl border border-glow/50 bg-glow/10 px-4 py-3 text-center text-sm font-semibold text-glow transition active:bg-glow/20";

  if (href) {
    return (
      <a href={href} onClick={onActivate} className={className}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" onClick={onActivate} className={className}>
      {label}
    </button>
  );
}
