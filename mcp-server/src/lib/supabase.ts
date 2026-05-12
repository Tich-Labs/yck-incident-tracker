import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { transport: ws } as unknown as NonNullable<Parameters<typeof createClient>[2]>["realtime"],
  global: { fetch: fetch.bind(globalThis) },
});

export interface Incident {
  _id: string;
  _creationTime: number;
  description: string;
  incidentDate: string;
  incidentTime?: string;
  incidentType: string;
  isEscalated: boolean;
  location: string;
  notes?: string;
  status: string;
  survivorAgeGroup: string;
  survivorGender: string;
  submitterContact?: string;
}

export interface ReferralService {
  _id: string;
  name: string;
  category: string;
  county: string;
  description?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export async function getIncident(id: string): Promise<Incident | null> {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as Incident;
}

export async function getActiveServices(): Promise<ReferralService[]> {
  const { data, error } = await supabase
    .from("referralServices")
    .select("*")
    .eq("isActive", true)
    .order("name");
  if (error) return [];
  return data as unknown as ReferralService[];
}

export async function listIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .order("_creationTime", { ascending: false });
  if (error) return [];
  return data as unknown as Incident[];
}
