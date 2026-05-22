import type { Metadata } from "next";
import { Bebas_Neue, Barlow_Condensed, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/ui/SplashScreen";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700"],
  variable: "--font-barlow",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mi Selección Colombia 2026 | Arma tu equipo",
  description:
    "Elige tus 23 jugadores de la prelista de Colombia para el Mundial 2026 y define tu 11 ideal.",
  openGraph: {
    title: "Mi Selección Colombia 2026",
    description: "¡Arma tu selección Colombia para el Mundial!",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${barlowCondensed.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-dvh flex flex-col antialiased">
          <SplashScreen />
          {children}
        </body>
    </html>
  );
}
