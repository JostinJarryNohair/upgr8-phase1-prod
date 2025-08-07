import { Database } from "./database";

export type PlayerPosition = Database["public"]["Enums"]["player_position"];

// What is displayed to the user
export interface PlayerFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  position?: PlayerPosition;
  jersey_number?: number;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  emergency_contact?: string;
  medical_notes?: string;
  is_active: boolean;
  coach_id?: string;
}

// What gets stored in database
export interface Player extends PlayerFormData {
  id: string;
  created_at: string;
  updated_at: string;
  coach_id?: string;
}

// Player with registration info for camp context
export interface PlayerWithRegistration extends Player {
  registration_id?: string;
  registration_status?: string;
  payment_status?: string;
  registration_date?: string;
  notes?: string;
}
