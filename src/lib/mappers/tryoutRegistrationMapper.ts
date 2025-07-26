import { 
  TryoutRegistrationFormData, 
  TryoutRegistrationWithDetails,
  RegistrationStatus 
} from "@/types/tryoutRegistration";

// Map database row to frontend format
export function fromDatabaseFormat(dbRow: Record<string, unknown>): TryoutRegistrationWithDetails {
  return {
    id: dbRow.id,
    tryout_id: dbRow.tryout_id,
    player_id: dbRow.player_id,
    status: dbRow.status as RegistrationStatus,
    notes: dbRow.notes || "",
    registration_date: dbRow.registration_date,
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
    // Include joined tryout data if present
    tryout: dbRow.tryout ? {
      id: dbRow.tryout.id,
      name: dbRow.tryout.name,
      description: dbRow.tryout.description,
      status: dbRow.tryout.status,
      level: dbRow.tryout.level,
      start_date: dbRow.tryout.start_date,
      end_date: dbRow.tryout.end_date,
      location: dbRow.tryout.location,
    } : undefined,
  };
}

// Map frontend form data to database format (for Supabase insert/update)
export function toDatabaseFormat(formData: TryoutRegistrationFormData): Record<string, unknown> {
  return {
    tryout_id: formData.tryout_id,
    player_id: formData.player_id,
    status: formData.status || 'confirmed',
    notes: formData.notes || null,
  };
} 