import Navbar from "@/components/layout/Navbar";
import LineupClient from "@/components/field/LineupClient";

export const metadata = {
  title: "Mi 11 Ideal | Mi Selección Colombia 2026",
};

export default function LineupPage() {
  return (
    <>
      <Navbar />
      <LineupClient />
    </>
  );
}
