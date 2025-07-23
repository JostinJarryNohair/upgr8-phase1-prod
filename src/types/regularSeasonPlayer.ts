import { Database } from "./database";

export type RegularSeasonPlayerStatus = Database["public"]["Enums"]["regular_season_player_status"];

// What is displayed to the user (form data)
export interface RegularSeasonPlayerFormData {
  regular_season_id: string;
  player_id: string;
  status?: RegularSeasonPlayerStatus; // 'active', 'inactive', 'injured', 'suspended'
  notes?: string;
}

// What gets stored in database (database format)
export interface RegularSeasonPlayer extends RegularSeasonPlayerFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

// Registration with player and regular season details (for JOIN queries)
export interface RegularSeasonPlayerWithDetails extends RegularSeasonPlayer {
  player?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    position?: string;
    jersey_number?: number;
    phone?: string;
    birth_date?: string;
    parent_name?: string;
    parent_email?: string;
    parent_phone?: string;
    emergency_contact?: string;
    medical_notes?: string;
    is_active?: boolean;
  };
  regular_season?: {
    id: string;
    name: string;
    description?: string;
    status?: string;
    level?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
  };
} 