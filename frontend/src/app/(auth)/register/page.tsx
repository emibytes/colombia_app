"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, oauthRedirectUrl } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

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
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#001e62] text-center tracking-wide">
        Crear cuenta
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { id: "name",                  label: "Nombre",           type: "text",     key: "name"                  },
          { id: "email",                 label: "Correo",           type: "email",    key: "email"                 },
          { id: "password",              label: "Contraseña",       type: "password", key: "password"              },
          { id: "password_confirmation", label: "Confirmar contraseña", type: "password", key: "password_confirmation" },
        ].map(({ id, label, type, key }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              id={id}
              type={type}
              required
              value={form[key as keyof typeof form]}
              onChange={field(key as keyof typeof form)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd100]"
            />
            {errors[key] && <p className="text-red-600 text-xs mt-1">{errors[key]}</p>}
          </div>
        ))}

        <div className="flex items-start gap-2">
          <input
            id="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 accent-[#001e62]"
            required
          />
          <label htmlFor="consent" className="text-xs text-gray-600 leading-snug">
            Acepto la{" "}
            <a
              href="https://emibytes.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#001e62] underline"
            >
              política de tratamiento de datos personales
            </a>{" "}
            conforme a la Ley 1581 de 2012. Tus datos no serán compartidos con terceros.
          </label>
        </div>
        {errors.data_treatment_accepted && (
          <p className="text-red-600 text-xs">{errors.data_treatment_accepted}</p>
        )}

        {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}

        <button
          type="submit"
          disabled={loading || !consent}
          className="w-full bg-[#ffd100] text-[#001e62] font-bold py-2 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <div className="relative flex items-center gap-3">
        <span className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">o regístrate con</span>
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="space-y-2">
        <a
          href={oauthRedirectUrl("google")}
          className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </a>
        <a
          href={oauthRedirectUrl("facebook")}
          className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.428c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/>
          </svg>
          Facebook
        </a>
      </div>

      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-[#001e62] font-semibold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
