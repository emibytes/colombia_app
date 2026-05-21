import { PlayerGroup } from "@/types";
import { getInitials, cn } from "@/lib/utils";

interface Props {
  name:       string;
  group:      PlayerGroup;
  size?:      "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-9 h-9 text-sm",
  md: "w-14 h-14 text-xl",
  lg: "w-full aspect-square text-3xl",
  xl: "w-full aspect-square text-5xl",
};

export default function PlayerAvatar({ name, group, size = "lg", className }: Props) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "avatar-" + group,
        "rounded-full flex items-center justify-center font-display font-black",
        "text-white/90 select-none shrink-0",
        SIZE_CLASSES[size],
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
