import {
  RegularSeasonPlayerFormData,
  RegularSeasonPlayerWithDetails,
  RegularSeasonPlayerStatus,
} from "@/types/regularSeasonPlayer";

// Map database row to frontend format (with joined data)
export function fromDatabaseFormat(dbRow: Record<string, unknown>): RegularSeasonPlayerWithDetails {
  return {
    id: dbRow.id as string,
    regular_season_id: dbRow.regular_season_id as string,
    player_id: dbRow.player_id as string,
    status: dbRow.status as RegularSeasonPlayerStatus,
    notes: (dbRow.notes as string) || "",
    created_at: dbRow.created_at as string,
    updated_at: dbRow.updated_at as string,

    // Include joined player data if present
    player: dbRow.player ? {
      id: (dbRow.player as Record<string, unknown>).id as string,
      first_name: (dbRow.player as Record<string, unknown>).first_name as string,
      last_name: (dbRow.player as Record<string, unknown>).last_name as string,
      email: (dbRow.player as Record<string, unknown>).email as string | undefined,
      position: (dbRow.player as Record<string, unknown>).position as string | undefined,
      jersey_number: (dbRow.player as Record<string, unknown>).jersey_number as number | undefined,
      phone: (dbRow.player as Record<string, unknown>).phone as string | undefined,
      birth_date: (dbRow.player as Record<string, unknown>).birth_date as string | undefined,
      parent_name: (dbRow.player as Record<string, unknown>).parent_name as string | undefined,
      parent_email: (dbRow.player as Record<string, unknown>).parent_email as string | undefined,
      parent_phone: (dbRow.player as Record<string, unknown>).parent_phone as string | undefined,
      emergency_contact: (dbRow.player as Record<string, unknown>).emergency_contact as string | undefined,
      medical_notes: (dbRow.player as Record<string, unknown>).medical_notes as string | undefined,
      is_active: (dbRow.player as Record<string, unknown>).is_active as boolean | undefined,
    } : undefined,

    // Include joined regular season data if present
    regular_season: dbRow.regular_season ? {
      id: (dbRow.regular_season as Record<string, unknown>).id as string,
      name: (dbRow.regular_season as Record<string, unknown>).name as string,
      description: (dbRow.regular_season as Record<string, unknown>).description as string,
      status: (dbRow.regular_season as Record<string, unknown>).status as string,
      level: (dbRow.regular_season as Record<string, unknown>).level as string,
      start_date: (dbRow.regular_season as Record<string, unknown>).start_date as string,
      end_date: (dbRow.regular_season as Record<string, unknown>).end_date as string,
      location: (dbRow.regular_season as Record<string, unknown>).location as string,
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