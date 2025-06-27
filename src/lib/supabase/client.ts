import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
