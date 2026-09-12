import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createProfile,
  deleteProfile,
  getProfileRecord,
  listProfileSummaries,
  updateProfile,
  verifyProfilePin,
} from "@/src/modules/profiles/server/profile-store";

describe("profile store", () => {
  let libraryRoot: string;

  beforeEach(async () => {
    libraryRoot = await mkdtemp(path.join(os.tmpdir(), "streamlt-profiles-"));
    process.env.VIDEO_LIBRARY_PATH = libraryRoot;
  });

  afterEach(async () => {
    await rm(libraryRoot, { recursive: true, force: true });
  });

  it("bootstraps the immutable Admin profile without storing its PIN in plaintext", async () => {
    const profiles = await listProfileSummaries();
    expect(profiles).toEqual([expect.objectContaining({ id: "admin", name: "Admin", isAdmin: true })]);
    const admin = await getProfileRecord("admin");
    expect(admin && await verifyProfilePin(admin, "1816")).toBe(true);
    expect(admin && await verifyProfilePin(admin, "0000")).toBe(false);
    const store = await readFile(path.join(libraryRoot, ".streamlt", "profiles.json"), "utf8");
    expect(store).not.toContain('"pin": "1816"');
    expect(store).toContain("pinHash");
  });

  it("creates, renames, and deletes a profile while preserving its videos", async () => {
    const profile = await createProfile({ name: "Alice", pin: "1234", avatarColor: "blue" });
    const oldFolder = path.join(libraryRoot, "Alice");
    await writeFile(path.join(oldFolder, "movie.mp4"), "video");

    const updated = await updateProfile(profile.id, { name: "Family", avatarColor: "green" });
    expect(updated.name).toBe("Family");
    await expect(readFile(path.join(libraryRoot, "Family", "movie.mp4"), "utf8")).resolves.toBe("video");

    await deleteProfile(profile.id);
    expect(await getProfileRecord(profile.id)).toBeNull();
    await expect(readFile(path.join(libraryRoot, "Family", "movie.mp4"), "utf8")).resolves.toBe("video");
  });

  it("rejects unsafe names, invalid PINs, duplicates, and existing folders", async () => {
    await expect(createProfile({ name: "../Alice", pin: "1234", avatarColor: "blue" })).rejects.toThrow();
    await expect(createProfile({ name: "Alice", pin: "12", avatarColor: "blue" })).rejects.toThrow();
    await createProfile({ name: "Alice", pin: "1234", avatarColor: "blue" });
    await expect(createProfile({ name: "alice", pin: "5678", avatarColor: "green" })).rejects.toThrow(/already exists/i);
    await writeFile(path.join(libraryRoot, "Bob"), "occupied");
    await expect(createProfile({ name: "Bob", pin: "5678", avatarColor: "green" })).rejects.toThrow(/file or folder/i);
  });
});

