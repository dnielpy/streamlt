"use client";

import { Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ProfileAvatar } from "@/src/modules/profiles/components/profile-avatar";
import {
  PROFILE_AVATAR_COLORS,
  type ProfileAvatarColor,
  type ProfileSummary,
} from "@/src/modules/profiles/types";

type EditorState = {
  profile: ProfileSummary | null;
  name: string;
  pin: string;
  avatarColor: ProfileAvatarColor;
};

const emptyEditor: EditorState = { profile: null, name: "", pin: "", avatarColor: "blue" };

export function ProfileManager({ initialProfiles }: { initialProfiles: ProfileSummary[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProfileSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const openCreate = () => {
    setError(null);
    setEditor({ ...emptyEditor });
  };

  const openEdit = (profile: ProfileSummary) => {
    setError(null);
    setEditor({ profile, name: profile.name, pin: "", avatarColor: profile.avatarColor });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor || pending) return;
    setPending(true);
    setError(null);
    try {
      const editing = Boolean(editor.profile);
      const response = await fetch(editing ? `/api/profiles/${editor.profile!.id}` : "/api/profiles", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editor.name, pin: editor.pin, avatarColor: editor.avatarColor }),
      });
      const payload = await response.json() as { profile?: ProfileSummary; error?: string };
      if (!response.ok || !payload.profile) throw new Error(payload.error || "Unable to save the profile.");
      setProfiles((current) => editing
        ? current.map((profile) => profile.id === payload.profile!.id ? payload.profile! : profile)
        : [...current, payload.profile!]);
      setEditor(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the profile.");
    } finally {
      setPending(false);
    }
  };

  const removeProfile = async () => {
    if (!deleteTarget || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/profiles/${deleteTarget.id}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to delete the profile.");
      setProfiles((current) => current.filter((profile) => profile.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the profile.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl" aria-labelledby="profiles-title">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Administration</p>
          <h1 id="profiles-title" className="mt-1 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Profiles</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Create private libraries and control who can open each one.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Plus className="h-4 w-4" /> Add profile
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {profiles.map((profile) => (
          <article key={profile.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <ProfileAvatar color={profile.avatarColor} initials={profile.initials} className="h-16 w-16 shrink-0 rounded-xl text-[4rem]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-semibold">{profile.name}</h2>
                {profile.isAdmin && <ShieldCheck aria-label="Administrator" className="h-4 w-4 shrink-0 text-red-500" />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{profile.isAdmin ? "All libraries · PIN locked" : `/${profile.name} · PIN locked`}</p>
            </div>
            {!profile.isAdmin && (
              <div className="flex shrink-0 gap-1">
                <button type="button" aria-label={`Edit ${profile.name}`} onClick={() => openEdit(profile)} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" aria-label={`Delete ${profile.name}`} onClick={() => { setError(null); setDeleteTarget(profile); }} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {editor && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="profile-editor-title" className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="profile-editor-title" className="text-2xl font-semibold tracking-[-0.03em]">{editor.profile ? "Edit profile" : "Add a profile"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Each profile gets a private folder and four-digit PIN.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setEditor(null)} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            <form className="mt-6" onSubmit={(event) => void submit(event)}>
              <div className="flex items-center gap-5">
                <ProfileAvatar color={editor.avatarColor} initials={editor.name.trim().slice(0, 2).toUpperCase() || "?"} className="h-24 w-24 shrink-0 rounded-xl text-[6rem]" />
                <div className="min-w-0 flex-1 space-y-4">
                  <label className="block text-sm font-medium">
                    Name
                    <input autoFocus required maxLength={50} value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.currentTarget.value })} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
                  </label>
                  <label className="block text-sm font-medium">
                    {editor.profile ? "New PIN (optional)" : "PIN"}
                    <input required={!editor.profile} value={editor.pin} onChange={(event) => setEditor({ ...editor, pin: event.currentTarget.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" pattern={editor.profile ? "[0-9]{4}|^$" : "[0-9]{4}"} placeholder={editor.profile ? "Leave blank to keep it" : "4 digits"} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
                  </label>
                </div>
              </div>

              <fieldset className="mt-6">
                <legend className="text-sm font-medium">Avatar color</legend>
                <div className="mt-3 grid grid-cols-5 gap-3">
                  {PROFILE_AVATAR_COLORS.map((color) => (
                    <button key={color} type="button" aria-label={`${color} avatar`} aria-pressed={editor.avatarColor === color} onClick={() => setEditor({ ...editor, avatarColor: color })} className={`rounded-xl p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${editor.avatarColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "opacity-75 hover:opacity-100"}`}>
                      <ProfileAvatar color={color} initials={editor.name.trim().slice(0, 2).toUpperCase() || "?"} className="w-full rounded-lg text-[3rem]" />
                    </button>
                  ))}
                </div>
              </fieldset>

              {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div className="mt-7 flex justify-end gap-2">
                <button type="button" onClick={() => setEditor(null)} className="h-11 rounded-full px-5 text-sm font-semibold transition hover:bg-muted">Cancel</button>
                <button type="submit" disabled={pending} className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-50">{pending ? "Saving…" : "Save profile"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-profile-title" className="w-full max-w-md rounded-3xl border border-border bg-card p-7 text-card-foreground shadow-2xl">
            <h2 id="delete-profile-title" className="text-xl font-semibold">Delete {deleteTarget.name}?</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">The profile will lose access immediately. Its folder and videos will not be deleted and will remain available to Admin.</p>
            {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="mt-7 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="h-11 rounded-full px-5 text-sm font-semibold transition hover:bg-muted">Cancel</button>
              <button type="button" disabled={pending} onClick={() => void removeProfile()} className="h-11 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">{pending ? "Deleting…" : "Delete profile"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

