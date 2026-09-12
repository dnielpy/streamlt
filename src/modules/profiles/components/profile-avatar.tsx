import type { ProfileAvatarColor } from "@/src/modules/profiles/types";

const colorClasses: Record<ProfileAvatarColor, string> = {
  red: "from-red-500 to-red-900",
  orange: "from-orange-400 to-orange-800",
  gold: "from-amber-300 to-yellow-700",
  green: "from-emerald-400 to-green-900",
  teal: "from-teal-300 to-cyan-800",
  blue: "from-sky-400 to-blue-900",
  indigo: "from-indigo-400 to-indigo-950",
  violet: "from-violet-400 to-purple-950",
  pink: "from-pink-400 to-rose-900",
  slate: "from-slate-400 to-slate-900",
};

type ProfileAvatarProps = {
  color: ProfileAvatarColor;
  initials: string;
  className?: string;
};

export function ProfileAvatar({ color, initials, className = "" }: ProfileAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid aspect-square place-items-center overflow-hidden bg-gradient-to-br [container-type:inline-size] ${colorClasses[color]} ${className}`}
    >
      <span className="absolute -bottom-[22%] h-[67%] w-[78%] rounded-t-[48%] bg-white/13" />
      <span className="absolute top-[18%] h-[34%] w-[34%] rounded-full bg-white/16" />
      <span className="relative text-[30cqw] font-medium tracking-[-0.05em] text-white/95 drop-shadow-md">{initials}</span>
    </span>
  );
}
