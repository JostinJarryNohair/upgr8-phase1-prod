import { RegularSeason, RegularSeasonFormData, RegularSeasonStatus } from "@/types/regularSeason";
import { Database } from "@/types/database";

// Use the generated database types
type DbRegularSeason = Database["public"]["Tables"]["regular_seasons"]["Row"];
type DbRegularSeasonInsert = Database["public"]["Tables"]["regular_seasons"]["Insert"];
type RegularSeasonStatusEnum = Database["public"]["Enums"]["regular_season_status"];
type CampLevelEnum = Database["public"]["Enums"]["camp_level"];

// Map database row to frontend format
export function fromDatabaseFormat(dbRow: DbRegularSeason): RegularSeason {
  return {
    id: dbRow.id,
    coach_id: dbRow.coach_id || "",
    team_id: dbRow.team_id || undefined,
    name: dbRow.name,
    description: dbRow.description || "",
    status: dbRow.status as RegularSeasonStatus,
    start_date: dbRow.start_date || "",
    end_date: dbRow.end_date || "",
    location: dbRow.location || "",
    level: dbRow.level as RegularSeason['level'],
    created_at: dbRow.created_at || "",
    updated_at: dbRow.updated_at || "",
  };
}

// Map frontend form data to database format (for Supabase insert/update)
export function toDatabaseFormat(formData: RegularSeasonFormData): Omit<DbRegularSeasonInsert, "id" | "created_at" | "updated_at" | "coach_id"> {
  return {
    name: formData.name,
    description: formData.description || null,
    status: formData.status as RegularSeasonStatusEnum,
    start_date: formData.start_date || null,
    end_date: formData.end_date || null,
    location: formData.location || null,
    level: formData.level as CampLevelEnum || null,
    team_id: null, // Will be set when creating from a team context
  };
}