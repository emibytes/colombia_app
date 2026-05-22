"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { register, oauthRedirectUrl } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

const INPUT_CLS =
  "w-full bg-[#0C1018] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-3 text-sm text-[#F0EDE8] placeholder-[#6B7280]/40 focus:outline-none focus:border-[rgba(252,209,22,0.55)] focus:shadow-[0_0_0_3px_rgba(252,209,22,0.06)] transition-all duration-300";

const FIELDS = [
  { id: "name",                  label: "Nombre",               type: "text",     key: "name"                  },
  { id: "email",                 label: "Correo electrónico",   type: "email",    key: "email"                 },
  { id: "password",              label: "Contraseña",           type: "password", key: "password"              },
  { id: "password_confirmation", label: "Confirmar contraseña", type: "password", key: "password_confirmation" },
] as const;

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token   = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) router.replace("/");
  }, [token, router]);

  const [form, setForm] = useState({
    name: "", email: "", password: "", password_confirmation: "",
  });
  const [consent, setConsent]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const { token, user } = await register({
        ...form,
        data_treatment_accepted: consent,
      });
      setAuth(token, user);
      router.push("/");
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { errors?: Record<string, string[]> } } }).response;
      const validationErrors = resp?.data?.errors ?? {};
      const flat: Record<string, string> = {};
      for (const [k, msgs] of Object.entries(validationErrors)) {
        flat[k] = (msgs as string[])[0];
      }
      setErrors(Object.keys(flat).length ? flat : { general: "Error al crear la cuenta." });
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
      {/* Mobile brand mark */}
      <motion.div variants={fadeUp} className="mb-8 md:hidden text-center">
        <span className="font-[family-name:var(--font-bebas)] text-2xl tracking-[0.35em] text-[#FCD116]">
          COL2026
        </span>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <span className="inline-flex items-center rounded-full bg-[rgba(252,209,22,0.08)] border border-[rgba(252,209,22,0.15)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-[#FCD116] mb-4">
          Registro
        </span>
        <h1 className="font-[family-name:var(--font-bebas)] text-5xl lg:text-6xl tracking-wide text-[#F0EDE8] leading-none">
          Crea tu
          <br />
          <span className="text-[#FCD116]">cuenta</span>
        </h1>
        <p className="text-[#6B7280] text-sm mt-2.5">
          Arma tu selección y comparte tu once ideal.
        </p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ id, label, type, key }) => (
          <motion.div key={id} variants={fadeUp}>
            <label
              htmlFor={id}
              className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-[#6B7280] mb-2"
            >
              {label}
            </label>
            <input
              id={id}
              type={type}
              required
              value={form[key]}
              onChange={field(key)}
              placeholder={type === "password" ? "••••••••" : undefined}
              className={INPUT_CLS}
            />
            <AnimatePresence>
              {errors[key] && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-1.5 text-[#CE1126] text-xs mt-1.5 overflow-hidden"
                >
                  <WarningCircle size={13} weight="fill" className="flex-none" />
                  {errors[key]}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Consent */}
        <motion.div variants={fadeUp}>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex-none">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="sr-only"
                required
              />
              <div
                className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                  consent
                    ? "bg-[#FCD116] border-[#FCD116]"
                    : "bg-[#0C1018] border-[rgba(252,209,22,0.2)] group-hover:border-[rgba(252,209,22,0.45)]"
                }`}
                onClick={() => setConsent((c) => !c)}
              >
                <AnimatePresence>
                  {consent && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <CheckCircle size={12} weight="fill" className="text-[#05080F]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <span className="text-[11px] text-[#6B7280] leading-snug">
              Acepto la{" "}
              <a
                href="https://emibytes.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FCD116] hover:text-white transition-colors duration-150 underline underline-offset-2"
              >
                política de tratamiento de datos
              </a>{" "}
              conforme a la Ley 1581 de 2012.
            </span>
          </label>
          <AnimatePresence>
            {errors.data_treatment_accepted && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-1.5 text-[#CE1126] text-xs mt-1.5 overflow-hidden"
              >
                <WarningCircle size={13} weight="fill" className="flex-none" />
                {errors.data_treatment_accepted}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* General error */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-[#CE1126] text-sm overflow-hidden"
            >
              <WarningCircle size={16} weight="fill" className="flex-none" />
              {errors.general}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.div variants={fadeUp} className="pt-1">
          <motion.button
            type="submit"
            disabled={loading || !consent}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.975 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-full bg-[#FCD116] text-[#05080F] font-bold py-3.5 rounded-xl text-sm tracking-wide hover:brightness-110 transition-[filter] duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Creando cuenta…
              </>
            ) : "Crear cuenta"}
          </motion.button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div variants={fadeUp} className="relative flex items-center gap-3 my-6">
        <span className="flex-1 h-px bg-[rgba(252,209,22,0.07)]" />
        <span className="text-[11px] text-[#6B7280]">o regístrate con</span>
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
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="text-[#FCD116] font-semibold hover:text-white transition-colors duration-200"
        >
          Inicia sesión
        </Link>
      </motion.p>
    </motion.div>
  );
}
