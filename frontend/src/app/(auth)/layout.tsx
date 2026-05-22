import AuthVisualPanel from "./AuthVisualPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#05080F] md:flex">
      {/* Left visual panel — sticky while right side scrolls */}
      <div className="hidden md:block md:w-[460px] lg:w-1/2 flex-none">
        <div className="sticky top-0 h-dvh">
          <AuthVisualPanel />
        </div>
      </div>

      {/* Right form panel */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 md:py-24 min-h-dvh">
        {children}
      </main>
    </div>
  );
}
