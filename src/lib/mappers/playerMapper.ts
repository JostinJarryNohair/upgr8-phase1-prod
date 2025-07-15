import { PlayerFormData, Player } from "@/types/player";
import { Database } from "@/types/database";

// Use the generated database types
type DbPlayer = Database["public"]["Tables"]["players"]["Row"];
type DbPlayerInsert = Database["public"]["Tables"]["players"]["Insert"];

export function toDatabaseFormat(player: PlayerFormData): DbPlayerInsert {
  return {
    first_name: player.first_name,
    last_name: player.last_name,
    email: player.email,
    phone: player.phone,
    birth_date: player.birth_date,
    position: player.position,
    jersey_number: player.jersey_number,
    parent_name: player.parent_name,
    parent_phone: player.parent_phone,
    parent_email: player.parent_email,
    emergency_contact: player.emergency_contact,
    medical_notes: player.medical_notes,
    is_active: player.is_active,
  };
}

export function fromDatabaseFormat(dbPlayer: DbPlayer): Player {
  return {
    id: dbPlayer.id,
    first_name: dbPlayer.first_name,
    last_name: dbPlayer.last_name,
    email: dbPlayer.email || undefined,
    phone: dbPlayer.phone || undefined,
    birth_date: dbPlayer.birth_date || undefined,
    position: dbPlayer.position || undefined,
    jersey_number: dbPlayer.jersey_number || undefined,
    parent_name: dbPlayer.parent_name || undefined,
    parent_phone: dbPlayer.parent_phone || undefined,
    parent_email: dbPlayer.parent_email || undefined,
    emergency_contact: dbPlayer.emergency_contact || undefined,
    medical_notes: dbPlayer.medical_notes || undefined,
    is_active: dbPlayer.is_active || false,
    created_at: dbPlayer.created_at || "",
    updated_at: dbPlayer.updated_at || "",
  };
}
