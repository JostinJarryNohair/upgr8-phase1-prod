import { Database } from './database';

// Database types
export type TeamPlayer = Database['public']['Tables']['team_players']['Row'];
export type TeamPlayerInsert = Database['public']['Tables']['team_players']['Insert'];
export type TeamPlayerUpdate = Database['public']['Tables']['team_players']['Update'];

// Extended types for UI
export interface TeamPlayerWithDetails extends TeamPlayer {
  player: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    position: Database['public']['Enums']['player_position'] | null;
    jersey_number: number | null;
    is_active: boolean | null;
  };
  team: {
    id: string;
    name: string;
    level: string | null;
  };
}

// Form data for creating/updating team players
export interface TeamPlayerFormData {
  player_id: string;
  team_id: string;
}

// Combined types for UI components
export interface TeamPlayerWithPlayerInfo {
  id: string;
  player_id: string;
  team_id: string;
  created_at: string | null;
  updated_at: string | null;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    position: Database['public']['Enums']['player_position'] | null;
    jersey_number: number | null;
    is_active: boolean | null;
  };
} 