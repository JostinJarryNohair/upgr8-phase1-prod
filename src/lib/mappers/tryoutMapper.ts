import { Tryout, TryoutFormData, TryoutStatus } from "@/types/tryout";

// Map database row to frontend format
export function fromDatabaseFormat(dbRow: Record<string, unknown>): Tryout {
  return {
    id: dbRow.id,
    coach_id: dbRow.coach_id,
    name: dbRow.name,
    description: dbRow.description || "",
    status: dbRow.status as TryoutStatus,
    start_date: dbRow.start_date || "",
    end_date: dbRow.end_date || "",
    location: dbRow.location || "",
    level: dbRow.level,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
  };
}

// Map frontend form data to database format (for Supabase insert/update)
export function toDatabaseFormat(formData: TryoutFormData): Record<string, unknown> {
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