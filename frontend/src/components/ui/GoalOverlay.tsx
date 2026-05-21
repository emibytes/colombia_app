"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "./Confetti";

interface Props {
  show:    boolean;
  text?:   string;
  onDone?: () => void;
}

export default function GoalOverlay({ show, text = "¡GOL!", onDone }: Props) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDone?.(), 2500);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <>
      <Confetti active={show} />
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(252,209,22,0.18)_0%,transparent_70%)]" />

            <motion.p
              className="font-display text-[clamp(5rem,20vw,14rem)] leading-none text-[var(--yellow)] relative z-10"
              style={{
                textShadow:
                  "0 0 60px rgba(252,209,22,0.7), 0 0 120px rgba(252,209,22,0.35)",
              }}
              initial={{ scale: 0.3, rotate: -12, opacity: 0 }}
              animate={{ scale: 1,   rotate: 0,   opacity: 1 }}
              exit={{    scale: 1.1, rotate: 3,   opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
            >
              {text}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
