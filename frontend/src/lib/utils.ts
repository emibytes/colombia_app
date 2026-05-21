import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PlayerGroup } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("col_session");
  if (!sid) {
    sid = `col_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("col_session", sid);
  }
  return sid;
}

export const GROUP_COLORS: Record<PlayerGroup, { from: string; to: string; text: string; bg: string }> = {
  GK:  { from: "#F7971E", to: "#FFD200", text: "#F7971E", bg: "rgba(247,151,30,0.15)" },
  DEF: { from: "#003087", to: "#1565C0", text: "#6B9FFF", bg: "rgba(0,48,135,0.2)"    },
  MID: { from: "#0D9488", to: "#059669", text: "#2DD4BF", bg: "rgba(13,148,136,0.15)" },
  FWD: { from: "#CE1126", to: "#FF4500", text: "#FF6B6B", bg: "rgba(206,17,38,0.2)"   },
};
