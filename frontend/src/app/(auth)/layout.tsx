export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#001e62] px-4">
      {children}
    </main>
  );
}
