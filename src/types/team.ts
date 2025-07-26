import { Tables } from "./database";

// Database format (what comes from Supabase)
export type TeamDatabase = Tables<"teams">;

// Application format (what we use in components)
export interface Team {
  id: string;
  coachId: string;
  name: string;
  level: string;
  createdAt: string;
}

// Form data format (what users input)
export interface TeamFormData {
  name: string;
  level: string;
} 