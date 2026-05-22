import { notFound } from "next/navigation";
import { SharedSelectionResponse } from "@/types";
import DuelClient from "@/components/layout/DuelClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

async function fetchShared(token: string): Promise<SharedSelectionResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  try {
    const res = await fetch(`${apiUrl}/selections/share/${token}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<SharedSelectionResponse>;
  } catch {
    return null;
  }
}

export default async function DuelPage({ params }: PageProps) {
  const { token } = await params;
  const shared    = await fetchShared(token);

  if (!shared || !shared.ok) notFound();

  return <DuelClient shared={shared} />;
}
