export const PROFILE_AVATAR_COLORS = [
  "red",
  "orange",
  "gold",
  "green",
  "teal",
  "blue",
  "indigo",
  "violet",
  "pink",
  "slate",
] as const;

export type ProfileAvatarColor = (typeof PROFILE_AVATAR_COLORS)[number];

export type ProfileSummary = {
  id: string;
  name: string;
  avatarColor: ProfileAvatarColor;
  initials: string;
  isAdmin: boolean;
};

export type LibraryScope = {
  profileId: string;
  isAdmin: boolean;
  folderName: string | null;
  key: string;
};

export type AuthenticatedProfile = ProfileSummary & {
  scope: LibraryScope;
};

