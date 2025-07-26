import {
  RegularSeasonPlayerFormData,
  RegularSeasonPlayerWithDetails,
  RegularSeasonPlayerStatus,
} from "@/types/regularSeasonPlayer";
import { Database } from "@/types/database";

// Use the generated database types
type DbRegularSeasonPlayer = Database["public"]["Tables"]["regular_season_players"]["Row"];
type DbRegularSeasonPlayerInsert = Database["public"]["Tables"]["regular_season_players"]["Insert"];
type DbPlayer = Database["public"]["Tables"]["players"]["Row"];
type DbRegularSeason = Database["public"]["Tables"]["regular_seasons"]["Row"];
type RegularSeasonPlayerStatusEnum = Database["public"]["Enums"]["regular_season_player_status"];

// Extended type for joined data
type DbRegularSeasonPlayerWithJoins = DbRegularSeasonPlayer & {
  player?: DbPlayer;
  regular_season?: DbRegularSeason;
};

// Map database row to frontend format (with joined data)
export function fromDatabaseFormat(dbRow: DbRegularSeasonPlayerWithJoins): RegularSeasonPlayerWithDetails {
  return {
    id: dbRow.id,
    regular_season_id: dbRow.regular_season_id || "",
    player_id: dbRow.player_id || "",
    status: dbRow.status as RegularSeasonPlayerStatus,
    notes: dbRow.notes || "",
    created_at: dbRow.created_at || "",
    updated_at: dbRow.updated_at || "",

    // Include joined player data if present
    player: dbRow.player ? {
      id: dbRow.player.id,
      first_name: dbRow.player.first_name,
      last_name: dbRow.player.last_name,
      email: dbRow.player.email || undefined,
      position: dbRow.player.position || undefined,
      jersey_number: dbRow.player.jersey_number || undefined,
      phone: dbRow.player.phone || undefined,
      birth_date: dbRow.player.birth_date || undefined,
      parent_name: dbRow.player.parent_name || undefined,
      parent_email: dbRow.player.parent_email || undefined,
      parent_phone: dbRow.player.parent_phone || undefined,
      emergency_contact: dbRow.player.emergency_contact || undefined,
      medical_notes: dbRow.player.medical_notes || undefined,
      is_active: dbRow.player.is_active || undefined,
    } : undefined,

    // Include joined regular season data if present
    regular_season: dbRow.regular_season ? {
      id: dbRow.regular_season.id,
      name: dbRow.regular_season.name,
      description: dbRow.regular_season.description || "",
      status: dbRow.regular_season.status || "",
      level: dbRow.regular_season.level || "",
      start_date: dbRow.regular_season.start_date || "",
      end_date: dbRow.regular_season.end_date || "",
      location: dbRow.regular_season.location || "",
    } : undefined,
  };
}

// Map frontend form data to database format (for Supabase insert/update)
export function toDatabaseFormat(formData: RegularSeasonPlayerFormData): Omit<DbRegularSeasonPlayerInsert, "id" | "created_at" | "updated_at"> {
  return {
    regular_season_id: formData.regular_season_id,
    player_id: formData.player_id,
    status: formData.status as RegularSeasonPlayerStatusEnum || 'active',
    notes: formData.notes || null,
  };
} 