import Link from "next/link";
import { getProfile } from "@/config";

export default function Home() {
  const profile = getProfile();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-3 px-5 py-10">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fog">
          {profile.appName}
        </p>
        <p className="mt-3 text-balance text-sm leading-relaxed text-fog">
          {profile.tagline}
        </p>
      </div>

      <Link
        href="/intensity"
        className="block rounded-3xl bg-glow px-6 py-10 text-center text-2xl font-bold tracking-wide text-night shadow-xl shadow-glow/20 transition active:scale-[0.99]"
      >
        I NEED INTENSITY
      </Link>

      <Link
        href="/evidence"
        className="block rounded-2xl border border-line bg-surface px-5 py-4 text-center font-semibold tracking-wide text-mist transition active:bg-line"
      >
        SHOW ME EVIDENCE I&rsquo;M CHANGING
      </Link>
      <Link
        href="/log-win"
        className="block rounded-2xl border border-line bg-surface px-5 py-4 text-center font-semibold tracking-wide text-mist transition active:bg-line"
      >
        LOG A WIN
      </Link>
      <Link
        href="/support"
        className="block rounded-2xl border border-line bg-surface px-5 py-4 text-center font-semibold tracking-wide text-mist transition active:bg-line"
      >
        SUPPORT
      </Link>
      <Link
        href="/decision"
        className="block rounded-2xl border border-line bg-surface px-5 py-4 text-center font-semibold tracking-wide text-mist transition active:bg-line"
      >
        BIG DECISION MODE
      </Link>

      <div className="mt-8 space-y-0.5 text-center text-xs leading-relaxed text-fog">
        {profile.corePromise.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </main>
  );
}
