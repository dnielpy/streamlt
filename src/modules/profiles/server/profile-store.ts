import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { chmod, lstat, mkdir, readFile, readdir, rename, rmdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { clearLibraryCaches, getLibraryRoot } from "@/src/modules/library/server/library";
import {
  PROFILE_AVATAR_COLORS,
  type ProfileAvatarColor,
  type ProfileSummary,
} from "@/src/modules/profiles/types";

const STORE_VERSION = 1;
const ADMIN_ID = "admin";
const ADMIN_PIN = "1816";
const MAX_NAME_LENGTH = 50;
const MAX_NAME_BYTES = 120;
const PIN_PATTERN = /^\d{4}$/;
const scryptAsync = promisify(scrypt);

type ProfileRecord = ProfileSummary & {
  folderName: string | null;
  pinHash: string;
  pinSalt: string;
  sessionVersion: number;
  createdAt: string;
};

type ProfileStore = {
  version: number;
  sessionSecret: string;
  profiles: ProfileRecord[];
};

export type CreateProfileInput = {
  name: string;
  pin: string;
  avatarColor: ProfileAvatarColor;
};

export type UpdateProfileInput = {
  name: string;
  pin?: string;
  avatarColor: ProfileAvatarColor;
};

export class ProfileStoreError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "ProfileStoreError";
  }
}

let mutationQueue = Promise.resolve();

function withMutationLock<T>(operation: () => Promise<T>) {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

function getStoreDirectory() {
  return path.join(getLibraryRoot(), ".streamlt");
}

function getStorePath() {
  return path.join(getStoreDirectory(), "profiles.json");
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.length > 1
    ? `${words[0][0] ?? ""}${words[words.length - 1][0] ?? ""}`
    : (words[0] ?? "?").slice(0, 2);

  return initials.toLocaleUpperCase();
}

function normalizeName(name: string) {
  return name.normalize("NFC").toLocaleLowerCase("en-US");
}

function isAvatarColor(value: unknown): value is ProfileAvatarColor {
  return typeof value === "string" && PROFILE_AVATAR_COLORS.includes(value as ProfileAvatarColor);
}

export function validateProfilePin(pin: string) {
  if (!PIN_PATTERN.test(pin)) {
    throw new ProfileStoreError("PIN must contain exactly four digits.");
  }

  return pin;
}

export function validateProfileName(value: string) {
  const name = value.trim().normalize("NFC");

  if (!name) throw new ProfileStoreError("Profile name is required.");
  if (name.length > MAX_NAME_LENGTH || Buffer.byteLength(name, "utf8") > MAX_NAME_BYTES) {
    throw new ProfileStoreError(`Profile name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  }
  if (name === "." || name === ".." || name.startsWith(".")) {
    throw new ProfileStoreError("Profile name cannot be hidden or relative.");
  }
  if (/[\\/\u0000-\u001f\u007f]/.test(name)) {
    throw new ProfileStoreError("Profile name contains unsupported characters.");
  }
  if (normalizeName(name) === "admin" || normalizeName(name) === ".streamlt") {
    throw new ProfileStoreError("That profile name is reserved.");
  }

  return name;
}

function validateAvatarColor(value: unknown) {
  if (!isAvatarColor(value)) {
    throw new ProfileStoreError("Choose a valid avatar color.");
  }

  return value;
}

async function hashPin(pin: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = await scryptAsync(pin, salt, 64) as Buffer;
  return { pinSalt: salt, pinHash: hash.toString("base64url") };
}

function validateStore(value: unknown): ProfileStore {
  if (!value || typeof value !== "object") throw new ProfileStoreError("Profile data is corrupted.", 500);
  const candidate = value as Partial<ProfileStore>;
  if (candidate.version !== STORE_VERSION || typeof candidate.sessionSecret !== "string" || !Array.isArray(candidate.profiles)) {
    throw new ProfileStoreError("Profile data uses an unsupported format.", 500);
  }

  for (const profile of candidate.profiles) {
    if (
      !profile || typeof profile.id !== "string" || typeof profile.name !== "string" ||
      typeof profile.pinHash !== "string" || typeof profile.pinSalt !== "string" ||
      typeof profile.isAdmin !== "boolean" || typeof profile.sessionVersion !== "number" ||
      typeof profile.createdAt !== "string" || !isAvatarColor(profile.avatarColor) ||
      (profile.folderName !== null && typeof profile.folderName !== "string")
    ) {
      throw new ProfileStoreError("Profile data is corrupted.", 500);
    }
    if (
      (profile.isAdmin && (profile.id !== ADMIN_ID || profile.name !== "Admin" || profile.folderName !== null)) ||
      (!profile.isAdmin && (profile.folderName !== profile.name || profile.id === ADMIN_ID))
    ) {
      throw new ProfileStoreError("Profile data is corrupted.", 500);
    }
    if (!profile.isAdmin) {
      try {
        validateProfileName(profile.name);
      } catch {
        throw new ProfileStoreError("Profile data is corrupted.", 500);
      }
    }
  }

  const ids = new Set(candidate.profiles.map((profile) => profile.id));
  const names = new Set(candidate.profiles.map((profile) => normalizeName(profile.name)));
  if (ids.size !== candidate.profiles.length || names.size !== candidate.profiles.length) {
    throw new ProfileStoreError("Profile data contains duplicate records.", 500);
  }

  if (!candidate.profiles.some((profile) => profile.id === ADMIN_ID && profile.isAdmin)) {
    throw new ProfileStoreError("The Admin profile is missing.", 500);
  }

  return candidate as ProfileStore;
}

async function writeStore(store: ProfileStore) {
  const directory = getStoreDirectory();
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporaryPath = path.join(directory, `profiles-${randomUUID()}.tmp`);
  try {
    await writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    await chmod(temporaryPath, 0o600);
    await rename(temporaryPath, getStorePath());
  } finally {
    await unlink(temporaryPath).catch(() => undefined);
  }
}

async function createInitialStore() {
  const { pinHash, pinSalt } = await hashPin(ADMIN_PIN);
  const store: ProfileStore = {
    version: STORE_VERSION,
    sessionSecret: randomBytes(32).toString("base64url"),
    profiles: [{
      id: ADMIN_ID,
      name: "Admin",
      avatarColor: "red",
      initials: "A",
      isAdmin: true,
      folderName: null,
      pinHash,
      pinSalt,
      sessionVersion: 1,
      createdAt: new Date(0).toISOString(),
    }],
  };

  await writeStore(store);
  return store;
}

async function readStoreUnsafe() {
  try {
    return validateStore(JSON.parse(await readFile(getStorePath(), "utf8")) as unknown);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      if (error instanceof SyntaxError) throw new ProfileStoreError("Profile data is corrupted.", 500);
      throw error;
    }

    return createInitialStore();
  }
}

async function readStore() {
  return withMutationLock(readStoreUnsafe);
}

function toSummary(profile: ProfileRecord): ProfileSummary {
  return {
    id: profile.id,
    name: profile.name,
    avatarColor: profile.avatarColor,
    initials: profile.initials,
    isAdmin: profile.isAdmin,
  };
}

function assertUniqueName(store: ProfileStore, name: string, ignoredId?: string) {
  const normalized = normalizeName(name);
  if (store.profiles.some((profile) => profile.id !== ignoredId && normalizeName(profile.name) === normalized)) {
    throw new ProfileStoreError("A profile with that name already exists.", 409);
  }
}

async function pathExists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function hasCaseInsensitiveLibraryEntry(name: string, ignoredName?: string) {
  const normalized = normalizeName(name);
  const entries = await readdir(getLibraryRoot());
  return entries.some((entry) => entry !== ignoredName && normalizeName(entry) === normalized);
}

export async function listProfileSummaries() {
  const store = await readStore();
  return store.profiles
    .slice()
    .sort((first, second) => Number(second.isAdmin) - Number(first.isAdmin) || first.createdAt.localeCompare(second.createdAt))
    .map(toSummary);
}

export async function getProfileRecord(profileId: string) {
  const store = await readStore();
  return store.profiles.find((profile) => profile.id === profileId) ?? null;
}

export async function getProfileSummariesForAdmin() {
  return listProfileSummaries();
}

export async function getSessionSecret() {
  return (await readStore()).sessionSecret;
}

export async function verifyProfilePin(profile: ProfileRecord, pin: string) {
  if (!PIN_PATTERN.test(pin)) return false;
  const candidate = await scryptAsync(pin, profile.pinSalt, 64) as Buffer;
  const expected = Buffer.from(profile.pinHash, "base64url");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export async function createProfile(input: CreateProfileInput) {
  return withMutationLock(async () => {
    const store = await readStoreUnsafe();
    const name = validateProfileName(input.name);
    const pin = validateProfilePin(input.pin);
    const avatarColor = validateAvatarColor(input.avatarColor);
    assertUniqueName(store, name);

    const folderPath = path.join(getLibraryRoot(), name);
    if (await pathExists(folderPath) || await hasCaseInsensitiveLibraryEntry(name)) {
      throw new ProfileStoreError("A file or folder with that profile name already exists.", 409);
    }

    await mkdir(folderPath);
    try {
      const { pinHash, pinSalt } = await hashPin(pin);
      const profile: ProfileRecord = {
        id: randomUUID(),
        name,
        avatarColor,
        initials: getInitials(name),
        isAdmin: false,
        folderName: name,
        pinHash,
        pinSalt,
        sessionVersion: 1,
        createdAt: new Date().toISOString(),
      };
      store.profiles.push(profile);
      await writeStore(store);
      clearLibraryCaches();
      return toSummary(profile);
    } catch (error) {
      await rmdir(folderPath).catch(() => undefined);
      throw error;
    }
  });
}

export async function updateProfile(profileId: string, input: UpdateProfileInput) {
  return withMutationLock(async () => {
    const store = await readStoreUnsafe();
    const index = store.profiles.findIndex((profile) => profile.id === profileId);
    if (index < 0) throw new ProfileStoreError("Profile not found.", 404);
    const current = store.profiles[index];
    if (current.isAdmin || !current.folderName) throw new ProfileStoreError("The Admin profile cannot be changed.", 403);

    const name = validateProfileName(input.name);
    const avatarColor = validateAvatarColor(input.avatarColor);
    const pin = input.pin === undefined || input.pin === "" ? null : validateProfilePin(input.pin);
    assertUniqueName(store, name, profileId);

    const oldFolderPath = path.join(getLibraryRoot(), current.folderName);
    const newFolderPath = path.join(getLibraryRoot(), name);
    let folderMoved = false;

    if (current.folderName !== name) {
      if (normalizeName(current.folderName) === normalizeName(name)) {
        const temporaryPath = path.join(getLibraryRoot(), `.streamlt-rename-${randomUUID()}`);
        await rename(oldFolderPath, temporaryPath);
        try {
          await rename(temporaryPath, newFolderPath);
        } catch (error) {
          await rename(temporaryPath, oldFolderPath).catch(() => undefined);
          throw error;
        }
      } else {
        if (await pathExists(newFolderPath) || await hasCaseInsensitiveLibraryEntry(name, current.folderName)) {
          throw new ProfileStoreError("A file or folder with that profile name already exists.", 409);
        }
        await rename(oldFolderPath, newFolderPath);
      }
      folderMoved = true;
    }

    try {
      const nextPin = pin ? await hashPin(pin) : { pinHash: current.pinHash, pinSalt: current.pinSalt };
      const updated: ProfileRecord = {
        ...current,
        name,
        folderName: name,
        avatarColor,
        initials: getInitials(name),
        ...nextPin,
        sessionVersion: current.sessionVersion + 1,
      };
      store.profiles[index] = updated;
      await writeStore(store);
      clearLibraryCaches();
      return toSummary(updated);
    } catch (error) {
      if (folderMoved) await rename(newFolderPath, oldFolderPath).catch(() => undefined);
      throw error;
    }
  });
}

export async function deleteProfile(profileId: string) {
  return withMutationLock(async () => {
    const store = await readStoreUnsafe();
    const profile = store.profiles.find((candidate) => candidate.id === profileId);
    if (!profile) throw new ProfileStoreError("Profile not found.", 404);
    if (profile.isAdmin) throw new ProfileStoreError("The Admin profile cannot be deleted.", 403);
    store.profiles = store.profiles.filter((candidate) => candidate.id !== profileId);
    await writeStore(store);
    clearLibraryCaches();
    return toSummary(profile);
  });
}
