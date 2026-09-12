"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ProfileAvatar } from "@/src/modules/profiles/components/profile-avatar";
import type { ProfileSummary } from "@/src/modules/profiles/types";

type ProfileSelectorProps = {
  profiles: ProfileSummary[];
  nextPath: string;
};

export function ProfileSelector({ profiles, nextPath }: ProfileSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<ProfileSummary | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const attemptedPinRef = useRef("");

  useEffect(() => {
    if (selected) inputRef.current?.focus();
  }, [selected]);

  const signIn = async (completePin: string) => {
    if (!selected || pending || attemptedPinRef.current === completePin) return;
    attemptedPinRef.current = completePin;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: selected.id, pin: completePin }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to sign in.");
      router.push(nextPath);
      router.refresh();
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to sign in.");
      setPin("");
      attemptedPinRef.current = "";
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } finally {
      setPending(false);
    }
  };

  const updatePin = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setPin(digits);
    setError(null);
    if (digits.length === 4) void signIn(digits);
  };

  const chooseProfile = (profile: ProfileSummary) => {
    setSelected(profile);
    setPin("");
    setError(null);
    attemptedPinRef.current = "";
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#141414] text-white">
      <header className="flex h-20 items-center px-6 sm:h-24 sm:px-12 lg:px-[4vw]">
        <Image src="/streamlt-logo.svg" alt="" width={42} height={42} priority className="h-9 w-9 sm:h-11 sm:w-11" />
        <span className="ml-2 text-xl font-bold tracking-[-0.07em] sm:text-2xl">Streamlt</span>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[92rem] items-center justify-center px-5 pb-24 sm:px-10">
        {!selected ? (
          <section className="w-full text-center animate-in fade-in zoom-in-95 duration-500" aria-labelledby="profile-heading">
            <h1 id="profile-heading" className="text-[clamp(2rem,4vw,4.2rem)] font-normal tracking-[-0.035em]">Who&apos;s watching?</h1>
            <div className="mx-auto mt-10 flex max-w-6xl flex-wrap justify-center gap-x-5 gap-y-9 sm:mt-12 sm:gap-x-7 lg:gap-x-9">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => chooseProfile(profile)}
                  className="group w-[min(36vw,10rem)] focus-visible:outline-none sm:w-40 lg:w-44"
                >
                  <ProfileAvatar
                    color={profile.avatarColor}
                    initials={profile.initials}
                    className="w-full rounded-md border-[3px] border-transparent text-[9rem] shadow-2xl transition duration-200 group-hover:border-white group-focus-visible:border-white group-focus-visible:ring-4 group-focus-visible:ring-white/25"
                  />
                  <span className="mt-3 block truncate text-base text-[#a3a3a3] transition group-hover:text-white group-focus-visible:text-white sm:text-xl">
                    {profile.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="w-full max-w-2xl text-center animate-in fade-in zoom-in-95 duration-300" aria-labelledby="pin-heading">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mx-auto mb-8 inline-flex items-center gap-2 text-sm text-[#b3b3b3] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to profiles
            </button>
            <ProfileAvatar color={selected.avatarColor} initials={selected.initials} className="mx-auto w-28 rounded-md text-[7rem] sm:w-32" />
            <h1 id="pin-heading" className="mt-7 text-3xl font-normal tracking-[-0.03em] sm:text-5xl">Enter your PIN</h1>
            <p className="mt-3 text-lg text-[#b3b3b3]">Profile lock for {selected.name}</p>

            <label className={`relative mx-auto mt-9 flex w-fit cursor-text gap-3 ${error ? "animate-[profile-shake_.32s_ease-in-out]" : ""}`}>
              <span className="sr-only">Four-digit PIN</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                value={pin}
                disabled={pending}
                onChange={(event) => updatePin(event.currentTarget.value)}
                className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
              />
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`grid h-16 w-14 place-items-center border-2 bg-[#202020] text-4xl transition sm:h-[4.5rem] sm:w-16 ${
                    error ? "border-[#e50914]" : index === pin.length ? "border-white" : "border-[#666]"
                  }`}
                >
                  {pin[index] ? "•" : ""}
                </span>
              ))}
            </label>
            <div aria-live="polite" className="mt-5 min-h-6 text-sm text-[#ff6b6b]">{error}</div>
            {pending && <p className="mt-1 text-sm text-[#b3b3b3]">Unlocking profile…</p>}
          </section>
        )}
      </div>
    </main>
  );
}
