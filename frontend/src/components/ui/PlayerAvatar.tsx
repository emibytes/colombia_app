import { useState } from "react";
import { PlayerGroup } from "@/types";
import { getInitials, cn } from "@/lib/utils";

interface Props {
  name:       string;
  group:      PlayerGroup;
  photo?:     string | null;
  size?:      "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-9 h-9 text-sm",
  md: "w-14 h-14 text-xl",
  lg: "w-full aspect-square text-3xl",
  xl: "w-full aspect-square text-5xl",
};

export default function PlayerAvatar({ name, group, photo, size = "lg", className }: Props) {
  const [imgError, setImgError] = useState(false);
  const initials  = getInitials(name);
  const showPhoto = !!photo && !imgError;

  return (
    <div
      className={cn(
        "avatar-" + group,
        "rounded-full flex items-center justify-center font-display font-black overflow-hidden",
        "text-white/90 select-none shrink-0",
        SIZE_CLASSES[size],
        className
      )}
      aria-label={name}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover object-top"
          onError={() => setImgError(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}
