import { RegularSeason, RegularSeasonFormData, RegularSeasonStatus } from "@/types/regularSeason";

// Map database row to frontend format
export function fromDatabaseFormat(dbRow: Record<string, unknown>): RegularSeason {
  return {
    id: dbRow.id as string,
    coach_id: dbRow.coach_id as string,
    name: dbRow.name as string,
    description: (dbRow.description as string) || "",
    status: dbRow.status as RegularSeasonStatus,
    start_date: (dbRow.start_date as string) || "",
    end_date: (dbRow.end_date as string) || "",
    location: (dbRow.location as string) || "",
    level: dbRow.level as RegularSeason['level'],
    created_at: dbRow.created_at as string,
    updated_at: dbRow.updated_at as string,
  };
}

// Map frontend form data to database format (for Supabase insert/update)
export function toDatabaseFormat(formData: RegularSeasonFormData): Record<string, unknown> {
  return {
    name: formData.name,
    description: formData.description || null,
    status: formData.status,
    start_date: formData.start_date || null,
    end_date: formData.end_date || null,
    location: formData.location || null,
    level: formData.level || null,
  };
} 