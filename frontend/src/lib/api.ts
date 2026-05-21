import axios from "axios";
import { SaveSelectionPayload, StatsResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const http = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

export async function saveSelection(payload: SaveSelectionPayload) {
  const { data } = await http.post("/selections", payload);
  return data as { ok: boolean; message: string; id?: number };
}

export async function getStats(): Promise<StatsResponse> {
  const { data } = await http.get("/selections/stats");
  return data as StatsResponse;
}
