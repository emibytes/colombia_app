import Navbar from "@/components/layout/Navbar";
import ResultClient from "@/components/layout/ResultClient";

export const metadata = {
  title: "Mi Resultado | Mi Selección Colombia 2026",
};

export default function ResultPage() {
  return (
    <>
      <Navbar />
      <ResultClient />
    </>
  );
}
