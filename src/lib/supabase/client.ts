import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Coach types
export type CoachRole = "coach" | "directeur-general" | "directeur-hockey";
export type CoachingLevel =
  | "initiation"
  | "regional"
  | "provincial"
  | "national"
  | "haute-performance";

export interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: CoachRole;
  coaching_level: CoachingLevel;
  created_at: string;
  updated_at: string;
}

export const COACH_ROLES: { value: CoachRole; label: string }[] = [
  { value: "coach", label: "Coach" },
  { value: "directeur-general", label: "Directeur Général" },
  { value: "directeur-hockey", label: "Directeur Hockey" },
];

export const COACHING_LEVELS: { value: CoachingLevel; label: string }[] = [
  { value: "initiation", label: "Initiation" },
  { value: "regional", label: "Régional" },
  { value: "provincial", label: "Provincial" },
  { value: "national", label: "National" },
  { value: "haute-performance", label: "Haute Performance" },
];
