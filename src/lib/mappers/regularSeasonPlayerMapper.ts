import {
  RegularSeasonPlayerFormData,
  RegularSeasonPlayerWithDetails,
  RegularSeasonPlayerStatus,
} from "@/types/regularSeasonPlayer";

// Map database row to frontend format (with joined data)
export function fromDatabaseFormat(dbRow: Record<string, unknown>): RegularSeasonPlayerWithDetails {
  return {
    id: dbRow.id,
    regular_season_id: dbRow.regular_season_id,
    player_id: dbRow.player_id,
    status: dbRow.status as RegularSeasonPlayerStatus,
    notes: dbRow.notes || "",
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,

    // Include joined player data if present
    player: dbRow.player ? {
      id: dbRow.player.id,
      first_name: dbRow.player.first_name,
      last_name: dbRow.player.last_name,
      email: dbRow.player.email,
      position: dbRow.player.position,
      jersey_number: dbRow.player.jersey_number,
      phone: dbRow.player.phone,
      birth_date: dbRow.player.birth_date,
      parent_name: dbRow.player.parent_name,
      parent_email: dbRow.player.parent_email,
      parent_phone: dbRow.player.parent_phone,
      emergency_contact: dbRow.player.emergency_contact,
      medical_notes: dbRow.player.medical_notes,
      is_active: dbRow.player.is_active,
    } : undefined,

    // Include joined regular season data if present
    regular_season: dbRow.regular_season ? {
      id: dbRow.regular_season.id,
      name: dbRow.regular_season.name,
      description: dbRow.regular_season.description,
      status: dbRow.regular_season.status,
      level: dbRow.regular_season.level,
      start_date: dbRow.regular_season.start_date,
      end_date: dbRow.regular_season.end_date,
      location: dbRow.regular_season.location,
    } : undefined,
  };
}

// Map frontend form data to database format (for Supabase insert/update)
export function toDatabaseFormat(formData: RegularSeasonPlayerFormData): Record<string, unknown> {
  return {
    regular_season_id: formData.regular_season_id,
    player_id: formData.player_id,
    status: formData.status || 'active',
    notes: formData.notes || null,
  };
} 