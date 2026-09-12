import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearLibraryCaches, getVideoById, listVideos, suggestVideoTitles } from "@/src/modules/library/server/library";
import type { LibraryScope } from "@/src/modules/profiles/types";

const adminScope: LibraryScope = { profileId: "admin", isAdmin: true, folderName: null, key: "admin:all" };
const aliceScope: LibraryScope = { profileId: "alice", isAdmin: false, folderName: "Alice", key: "profile:alice:1" };
const bobScope: LibraryScope = { profileId: "bob", isAdmin: false, folderName: "Bob", key: "profile:bob:1" };

describe("profile-scoped video library", () => {
  let libraryRoot: string;

  beforeEach(async () => {
    libraryRoot = await mkdtemp(path.join(os.tmpdir(), "streamlt-library-"));
    process.env.VIDEO_LIBRARY_PATH = libraryRoot;
    process.env.VIDEO_CACHE_PATH = path.join(libraryRoot, ".cache");
    await mkdir(path.join(libraryRoot, "Alice"));
    await mkdir(path.join(libraryRoot, "Bob"));
    await writeFile(path.join(libraryRoot, "legacy.mp4"), "legacy");
    await writeFile(path.join(libraryRoot, "Alice", "alice-movie.mp4"), "alice");
    await writeFile(path.join(libraryRoot, "Bob", "bob-movie.mp4"), "bob");
    clearLibraryCaches();
  });

  afterEach(async () => {
    clearLibraryCaches();
    await rm(libraryRoot, { recursive: true, force: true });
  });

  it("shows every video to Admin and only a profile folder to normal profiles", async () => {
    const admin = await listVideos({ scope: adminScope });
    const alice = await listVideos({ scope: aliceScope });
    const bob = await listVideos({ scope: bobScope });
    expect(admin.items.map((video) => video.title).sort()).toEqual(["alice-movie", "bob-movie", "legacy"]);
    expect(alice.items.map((video) => video.title)).toEqual(["alice-movie"]);
    expect(bob.items.map((video) => video.title)).toEqual(["bob-movie"]);
  });

  it("does not resolve a video ID or search result outside the active scope", async () => {
    const alice = await listVideos({ scope: aliceScope });
    expect(await getVideoById(bobScope, alice.items[0].id)).toBeNull();
    expect(await suggestVideoTitles(bobScope, "alice")).toEqual([]);
  });

  it("does not accept a pagination cursor from another scope", async () => {
    await writeFile(path.join(libraryRoot, "Alice", "another.mp4"), "alice-2");
    await writeFile(path.join(libraryRoot, "Bob", "another-bob.mp4"), "bob-2");
    clearLibraryCaches();
    const alice = await listVideos({ scope: aliceScope, limit: 1 });
    expect(alice.nextCursor).toBeTruthy();
    const bob = await listVideos({ scope: bobScope, cursor: alice.nextCursor!, limit: 1 });
    expect(bob.items[0].title).toMatch(/bob/);
  });
});

