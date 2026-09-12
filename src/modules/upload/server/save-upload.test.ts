import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createProfile } from "@/src/modules/profiles/server/profile-store";
import type { LibraryScope } from "@/src/modules/profiles/types";
import { saveUpload } from "@/src/modules/upload/server/save-upload";

function body(value: string) {
  return new Response(value).body as ReadableStream<Uint8Array>;
}

describe("profile-scoped uploads", () => {
  let libraryRoot: string;
  let aliceId: string;
  let bobId: string;

  beforeEach(async () => {
    libraryRoot = await mkdtemp(path.join(os.tmpdir(), "streamlt-upload-"));
    process.env.VIDEO_LIBRARY_PATH = libraryRoot;
    aliceId = (await createProfile({ name: "Alice", pin: "1234", avatarColor: "blue" })).id;
    bobId = (await createProfile({ name: "Bob", pin: "5678", avatarColor: "green" })).id;
  });

  afterEach(async () => {
    await rm(libraryRoot, { recursive: true, force: true });
  });

  it("stores normal uploads inside the active profile only", async () => {
    const scope: LibraryScope = { profileId: aliceId, isAdmin: false, folderName: "Alice", key: `profile:${aliceId}:1` };
    await saveUpload({ body: body("alice"), fileName: "movie.mp4", scope });
    await expect(readFile(path.join(libraryRoot, "Alice", "movie.mp4"), "utf8")).resolves.toBe("alice");
    await expect(saveUpload({ body: body("blocked"), fileName: "blocked.mp4", targetProfileId: bobId, scope })).rejects.toThrow(/another profile/i);
  });

  it("allows Admin to target a profile or the legacy root", async () => {
    const scope: LibraryScope = { profileId: "admin", isAdmin: true, folderName: null, key: "admin:all" };
    await saveUpload({ body: body("bob"), fileName: "bob.mp4", targetProfileId: bobId, scope });
    await saveUpload({ body: body("legacy"), fileName: "legacy.mp4", scope });
    await expect(readFile(path.join(libraryRoot, "Bob", "bob.mp4"), "utf8")).resolves.toBe("bob");
    await expect(readFile(path.join(libraryRoot, "legacy.mp4"), "utf8")).resolves.toBe("legacy");
  });
});
