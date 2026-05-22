import { Suspense } from "react";
import AuthCallbackContent from "./AuthCallbackContent";

export const dynamic = "force-dynamic";

function AuthCallbackLoading() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#001e62]">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="mt-4">Autenticando...</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
