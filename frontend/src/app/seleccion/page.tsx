import Navbar from "@/components/layout/Navbar";
import SelectionClient from "@/components/player/SelectionClient";

export const metadata = {
  title: "Selecciona tus 23 | Mi Selección Colombia 2026",
};

export default function SelectionPage() {
  return (
    <>
      <Navbar />
      <SelectionClient />
    </>
  );
}
