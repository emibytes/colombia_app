"use client";
import { useState, RefObject } from "react";
import { motion } from "framer-motion";
import { ShareNetwork, DownloadSimple } from "@phosphor-icons/react";

interface Props {
  captureRef: RefObject<HTMLDivElement | null>;
  filename?: string;
}

export default function ShareImageButton({ captureRef, filename = "mi-seleccion-colombia.png" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handle = async () => {
    if (!captureRef.current || state === "loading") return;
    setState("loading");

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: "#05080f",
        pixelRatio: 2,
        cacheBust: true,
      });

      const blob  = await fetch(dataUrl).then((r) => r.blob());
      const file  = new File([blob], filename, { type: "image/png" });

      if (typeof navigator.share === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Mi Selección Colombia 2026",
          text:  "¡Esta es mi selección Colombia para el Mundial 2026! ¿La tuya?",
          files: [file],
        });
      } else {
        const a  = document.createElement("a");
        a.href   = dataUrl;
        a.download = filename;
        a.click();
      }
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("idle");
    }
  };

  return (
    <motion.button
      onClick={handle}
      disabled={state === "loading"}
      className="group flex items-center gap-2.5 border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--yellow)] font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      {state === "done"
        ? <DownloadSimple size={18} weight="bold" />
        : <ShareNetwork  size={18} weight="bold" />}
      {state === "loading" ? "Generando imagen…"
       : state === "done"  ? "¡Imagen lista!"
       : "Compartir mi selección"}
    </motion.button>
  );
}
