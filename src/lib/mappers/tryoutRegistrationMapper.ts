import { 
  TryoutRegistrationFormData, 
  TryoutRegistrationWithDetails,
  RegistrationStatus 
} from "@/types/tryoutRegistration";
import { Database } from "@/types/database";

// Use the generated database types
type DbTryoutRegistration = Database["public"]["Tables"]["tryout_registrations"]["Row"];
type DbTryoutRegistrationInsert = Database["public"]["Tables"]["tryout_registrations"]["Insert"];
type DbPlayer = Database["public"]["Tables"]["players"]["Row"];
type DbTryout = Database["public"]["Tables"]["tryouts"]["Row"];
type RegistrationStatusEnum = Database["public"]["Enums"]["registration_status"];

// Extended type for joined data
type DbTryoutRegistrationWithJoins = DbTryoutRegistration & {
  player?: DbPlayer;
  tryout?: DbTryout;
};

// Map database row to frontend format
export function fromDatabaseFormat(dbRow: DbTryoutRegistrationWithJoins): TryoutRegistrationWithDetails {
  return {
    id: dbRow.id,
    tryout_id: dbRow.tryout_id,
    player_id: dbRow.player_id,
    status: dbRow.status as RegistrationStatus,
    notes: dbRow.notes || "",
    registration_date: dbRow.registration_date || "",
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
    // Include joined tryout data if present
    tryout: dbRow.tryout ? {
      id: dbRow.tryout.id,
      name: dbRow.tryout.name,
      description: dbRow.tryout.description || "",
      status: dbRow.tryout.status || "",
      level: dbRow.tryout.level || "",
      start_date: dbRow.tryout.start_date || "",
      end_date: dbRow.tryout.end_date || "",
      location: dbRow.tryout.location || "",
    } : undefined,
  };
}

// Map frontend form data to database format (for Supabase insert/update)
export function toDatabaseFormat(formData: TryoutRegistrationFormData): Omit<DbTryoutRegistrationInsert, "id" | "created_at" | "updated_at"> {
  return {
    tryout_id: formData.tryout_id,
    player_id: formData.player_id,
    status: formData.status as RegistrationStatusEnum || 'confirmed',
    notes: formData.notes || null,
    registration_date: new Date().toISOString(), // Auto-generate registration date
  };
} 