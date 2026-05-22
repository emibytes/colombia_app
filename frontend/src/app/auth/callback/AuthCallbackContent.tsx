"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { getMe } from "@/lib/api";

export default function AuthCallbackContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState<"loading" | "consent" | "error">("loading");
  const [token, setToken]   = useState<string | null>(null);

  useEffect(() => {
    const t     = params.get("token");
    const error = params.get("error");

    if (error || !t) {
      setStatus("error");
      return;
    }

    setToken(t);

    const needsConsent = params.get("needs_consent") === "1";
    if (needsConsent) {
      setStatus("consent");
      return;
    }

    // Auto-finish when no consent needed
    finalise(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function finalise(t: string) {
    try {
      // Temporarily store token so getMe() interceptor can use it
      localStorage.setItem("colombia-auth", JSON.stringify({ state: { token: t } }));
      const user = await getMe();
      setAuth(t, user);
      router.replace(user.role === "admin" ? "/admin" : "/");
    } catch {
      setStatus("error");
    }
  }

  async function acceptConsent() {
    if (!token) return;
    // Persist consent server-side
    try {
      const { http } = await import("@/lib/api");
      await http.post("/auth/accept-consent", {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // non-fatal — consent was already stored during OAuth flow creation
    }
    finalise(token);
  }

  if (status === "error") {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#001e62]">
        <div className="bg-white rounded-2xl p-8 max-w-sm text-center space-y-4">
          <p className="text-red-600 font-semibold">Error al autenticar. Intenta de nuevo.</p>
          <a href="/login" className="text-[#001e62] underline text-sm">Volver al login</a>
        </div>
      </main>
    );
  }

  if (status === "consent") {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#001e62] px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full space-y-5">
          <h2 className="font-[family-name:var(--font-bebas)] text-3xl text-[#001e62] text-center">
            Política de datos
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Para continuar, acepta la{" "}
            <a
              href="https://emibytes.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#001e62] underline"
            >
              política de tratamiento de datos personales
            </a>{" "}
            conforme a la Ley 1581 de 2012. Tus datos no serán compartidos con terceros. Las
            estadísticas son públicas de forma agregada y anónima.
          </p>
          <button
            onClick={acceptConsent}
            className="w-full bg-[#ffd100] text-[#001e62] font-bold py-2 rounded-lg hover:bg-yellow-400 transition"
          >
            Acepto y continuar
          </button>
          <a href="/login" className="block text-center text-sm text-gray-500 hover:underline">
            Cancelar
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#001e62]">
      <p className="text-white text-lg animate-pulse">Autenticando…</p>
    </main>
  );
}
