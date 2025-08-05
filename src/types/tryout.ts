import { Database } from "./database";

// Database enum types
export type TryoutStatus = "active" | "completed" | "cancelled";
export type CampLevel = Database["public"]["Enums"]["camp_level"];

// What is displayed to the user (form data)
export interface TryoutFormData {
  name: string;
  description?: string;
  status: TryoutStatus;
  start_date?: string;
  end_date?: string;
  location?: string;
  level?: CampLevel;
}

// What gets stored in database (database format)
export interface Tryout extends TryoutFormData {
  id: string;
  coach_id: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
}

// Tryout with additional computed fields for UI
export interface TryoutWithStats extends Tryout {
  total_players?: number;
  selected_players?: number;
  cut_players?: number;
} 