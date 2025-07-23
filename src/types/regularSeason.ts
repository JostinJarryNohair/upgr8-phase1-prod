import { Database } from "./database";

export type RegularSeasonStatus = Database["public"]["Enums"]["regular_season_status"];
export type CampLevel = Database["public"]["Enums"]["camp_level"];

// What is displayed to the user (form data)
export interface RegularSeasonFormData {
  name: string;
  description?: string;
  status: RegularSeasonStatus;
  start_date?: string;
  end_date?: string;
  location?: string;
  level?: CampLevel;
}

// What gets stored in database (database format)
export interface RegularSeason extends RegularSeasonFormData {
  id: string;
  coach_id: string;
  created_at: string;
  updated_at: string;
}

// Regular season with additional computed fields for UI
export interface RegularSeasonWithStats extends RegularSeason {
  total_players?: number;
  active_players?: number;
  inactive_players?: number;
  injured_players?: number;
  suspended_players?: number;
} 