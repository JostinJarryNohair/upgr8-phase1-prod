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
      id: (dbRow.player as any).id as string,
      first_name: (dbRow.player as any).first_name as string,
      last_name: (dbRow.player as any).last_name as string,
      email: (dbRow.player as any).email as string,
      position: (dbRow.player as any).position,
      jersey_number: (dbRow.player as any).jersey_number as number,
      phone: (dbRow.player as any).phone as string,
      birth_date: (dbRow.player as any).birth_date as string,
      parent_name: (dbRow.player as any).parent_name as string,
      parent_email: (dbRow.player as any).parent_email as string,
      parent_phone: (dbRow.player as any).parent_phone as string,
      emergency_contact: (dbRow.player as any).emergency_contact as string,
      medical_notes: (dbRow.player as any).medical_notes as string,
      is_active: (dbRow.player as any).is_active as boolean,
    } : undefined,

    // Include joined regular season data if present
    regular_season: dbRow.regular_season ? {
      id: (dbRow.regular_season as any).id as string,
      name: (dbRow.regular_season as any).name as string,
      description: (dbRow.regular_season as any).description as string,
      status: (dbRow.regular_season as any).status as string,
      level: (dbRow.regular_season as any).level as string,
      start_date: (dbRow.regular_season as any).start_date as string,
      end_date: (dbRow.regular_season as any).end_date as string,
      location: (dbRow.regular_season as any).location as string,
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