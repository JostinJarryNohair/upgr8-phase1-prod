import {
  CampRegistrationFormData,
  CampRegistration,
} from "@/types/campRegistration";
import { Database } from "@/types/database";

// Use the generated database types
type DbCampRegistration =
  Database["public"]["Tables"]["camp_registrations"]["Row"];
type DbCampRegistrationInsert =
  Database["public"]["Tables"]["camp_registrations"]["Insert"];

export function toDatabaseFormat(
  registration: CampRegistrationFormData
): DbCampRegistrationInsert {
  return {
    camp_id: registration.camp_id,
    player_id: registration.player_id,
    status: registration.status,
    payment_status: registration.payment_status,
    notes: registration.notes,
  };
}

export function fromDatabaseFormat(
  dbRegistration: DbCampRegistration
): CampRegistration {
  return {
    id: dbRegistration.id,
    camp_id: dbRegistration.camp_id || "",
    player_id: dbRegistration.player_id || "",
    status: dbRegistration.status || undefined,
    payment_status: dbRegistration.payment_status || undefined,
    notes: dbRegistration.notes || undefined,
    registration_date: dbRegistration.registration_date || "",
    created_at: dbRegistration.created_at || "",
    updated_at: dbRegistration.updated_at || "",
  };
}
