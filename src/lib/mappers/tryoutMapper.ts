import { Tryout, TryoutFormData, TryoutStatus } from "@/types/tryout";
import { CampLevel } from "@/types/camp";
import { Database } from "@/types/database";

// Use the generated database types
type DbTryout = Database["public"]["Tables"]["tryouts"]["Row"];
type DbTryoutInsert = Database["public"]["Tables"]["tryouts"]["Insert"];
type TryoutStatusEnum = Database["public"]["Enums"]["tryout_status"];
type CampLevelEnum = Database["public"]["Enums"]["camp_level"];

// Map database row to frontend format
export function fromDatabaseFormat(dbRow: any): Tryout {
  return {
    id: dbRow.id,
    coach_id: dbRow.coach_id,
    team_id: dbRow.team_id || undefined,
    name: dbRow.name,
    description: dbRow.description || "",
    status: dbRow.status as TryoutStatus,
    start_date: dbRow.start_date || "",
    end_date: dbRow.end_date || "",
    location: dbRow.location || "",
    level: dbRow.level as CampLevel,
    created_at: dbRow.created_at || "",
    updated_at: dbRow.updated_at || "",
  };
}

// Map frontend form data to database format (for Supabase insert/update)
export function toDatabaseFormat(formData: TryoutFormData): Omit<DbTryoutInsert, "coach_id"> {
  return {
    name: formData.name,
    description: formData.description || null,
    status: formData.status as TryoutStatusEnum,
    start_date: formData.start_date || null,
    end_date: formData.end_date || null,
    location: formData.location || null,
    level: formData.level as CampLevelEnum || null,
  };
} 