"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { WarningCircle } from "@phosphor-icons/react";
import { login, oauthRedirectUrl } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const EASE_OUT = [0.32, 0.72, 0, 1] as [number, number, number, number];

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const INPUT_CLS =
  "w-full bg-[#0C1018] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-3 text-sm text-[#F0EDE8] placeholder-[#6B7280]/40 focus:outline-none focus:border-[rgba(252,209,22,0.55)] focus:shadow-[0_0_0_3px_rgba(252,209,22,0.06)] transition-all duration-300";

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token   = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) router.replace("/");
  }, [token, router]);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login({ email, password });
      setAuth(token, user);
      router.push(user.role === "admin" ? "/admin" : "/");
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[400px]"
    >
      {/* Mobile brand mark — hidden on md+ */}
      <motion.div variants={fadeUp} className="mb-8 md:hidden text-center">
        <span className="font-[family-name:var(--font-bebas)] text-2xl tracking-[0.35em] text-[#FCD116]">
          COL2026
        </span>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <span className="inline-flex items-center rounded-full bg-[rgba(252,209,22,0.08)] border border-[rgba(252,209,22,0.15)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-[#FCD116] mb-4">
          Acceso
        </span>
        <h1 className="font-[family-name:var(--font-bebas)] text-5xl lg:text-6xl tracking-wide text-[#F0EDE8] leading-none">
          Bienvenido
          <br />
          <span className="text-[#FCD116]">de vuelta</span>
        </h1>
        <p className="text-[#6B7280] text-sm mt-2.5">
          Ingresa para ver y armar tu selección Colombia.
        </p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#6B7280] mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className={INPUT_CLS}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#6B7280] mb-2">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={INPUT_CLS}
          />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="flex items-center gap-2 text-[#CE1126] text-sm overflow-hidden"
            >
              <WarningCircle size={16} weight="fill" className="flex-none" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={fadeUp} className="pt-1">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.975 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-full bg-[#FCD116] text-[#05080F] font-bold py-3.5 rounded-xl text-sm tracking-wide hover:brightness-110 transition-[filter] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Ingresando…
              </>
            ) : "Ingresar"}
          </motion.button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div variants={fadeUp} className="relative flex items-center gap-3 my-6">
        <span className="flex-1 h-px bg-[rgba(252,209,22,0.07)]" />
        <span className="text-[11px] text-[#6B7280]">o continúa con</span>
        <span className="flex-1 h-px bg-[rgba(252,209,22,0.07)]" />
      </motion.div>

      {/* OAuth */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <motion.a
          href={oauthRedirectUrl("google")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center justify-center gap-2 bg-[#0C1018] border border-[rgba(252,209,22,0.08)] rounded-xl py-3 text-sm text-[#F0EDE8]/75 hover:border-[rgba(252,209,22,0.22)] hover:text-[#F0EDE8] transition-all duration-200"
        >
          <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </motion.a>

        <motion.a
          href={oauthRedirectUrl("facebook")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center justify-center gap-2 bg-[#0C1018] border border-[rgba(252,209,22,0.08)] rounded-xl py-3 text-sm text-[#F0EDE8]/75 hover:border-[rgba(252,209,22,0.22)] hover:text-[#F0EDE8] transition-all duration-200"
        >
          <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.428c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/>
          </svg>
          Facebook
        </motion.a>
      </motion.div>

      <motion.p variants={fadeUp} className="text-center text-sm text-[#6B7280] mt-8">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="text-[#FCD116] font-semibold hover:text-white transition-colors duration-200"
        >
          Regístrate
        </Link>
      </motion.p>
    </motion.div>
  );
}
