"use client";
import { useEffect, useRef } from "react";

const COLORS = ["#FCD116", "#003087", "#CE1126", "#FFFFFF", "#FFD200"];

interface Props {
  active: boolean;
  onDone?: () => void;
}

export default function Confetti({ active, onDone }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const wrap = containerRef.current;
    wrap.innerHTML = "";

    for (let i = 0; i < 90; i++) {
      const dot = document.createElement("div");
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      const isCircle = Math.random() > 0.5;
      const size = 6 + Math.random() * 8;

      dot.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}vw;
        top: ${-20 - Math.random() * 60}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${isCircle ? "50%" : "2px"};
        animation: confetti-fall ${1.4 + Math.random()}s ease-in forwards;
        animation-delay: ${Math.random() * 0.6}s;
        pointer-events: none;
      `;
      wrap.appendChild(dot);
    }

    const timer = setTimeout(() => {
      wrap.innerHTML = "";
      onDone?.();
    }, 2800);

    return () => clearTimeout(timer);
  }, [active, onDone]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] overflow-hidden pointer-events-none"
    />
  );
}
