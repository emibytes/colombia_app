"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowCounterClockwise, FloppyDisk, PencilSimple, UsersThree } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  status: SaveStatus;
  onSave: () => void;
  onReset: () => void;
  shareToken: string | null;
}

export default function ResultActions({ status, onSave, onReset, shareToken }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyDuelLink = async () => {
    const url = `${window.location.origin}/duelo/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copia este enlace:", url);
    }
  };

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-4 mb-6 flex flex-wrap gap-3 justify-center">
        <motion.button
          onClick={onSave}
          disabled={status === "saving" || status === "saved"}
          className={cn(
            "group flex items-center gap-2.5 font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-300",
            status === "saved"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : status === "error"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-[var(--yellow)] text-black hover:shadow-[0_0_40px_rgba(252,209,22,0.4)] hover:-translate-y-0.5"
          )}
          whileHover={status === "idle" ? { scale: 1.02 } : {}}
          whileTap={status === "idle"   ? { scale: 0.97 } : {}}
        >
          <FloppyDisk size={18} weight="bold" />
          {status === "saving" ? "Guardando…"
           : status === "saved"  ? "¡Guardado con éxito!"
           : status === "error"  ? "Error — reintentar"
           : "Guardar mi selección"}
        </motion.button>

        {shareToken && (
          <motion.button
            onClick={handleCopyDuelLink}
            className="flex items-center gap-2.5 border border-[var(--blue)]/60 text-[var(--blue)] hover:border-[var(--blue)] hover:text-white font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {copied ? "¡Enlace copiado!" : "Retar a un amigo"}
          </motion.button>
        )}

        <Link href="/once">
          <button className="flex items-center gap-2 border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-300">
            <PencilSimple size={16} weight="bold" />
            Editar mi 11
          </button>
        </Link>

        <Link href="/seleccion">
          <button className="flex items-center gap-2 border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-300">
            <UsersThree size={16} weight="bold" />
            Editar mis 23
          </button>
        </Link>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 flex justify-center pb-4">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--red)] transition-colors duration-200"
        >
          <ArrowCounterClockwise size={13} weight="bold" />
          Empezar de nuevo desde cero
        </button>
      </div>
    </>
  );
}
