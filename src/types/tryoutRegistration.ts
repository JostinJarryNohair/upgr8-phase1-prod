import { Database } from "./database";

export type RegistrationStatus = Database["public"]["Enums"]["registration_status"];

// What is displayed to the user (form data)
export interface TryoutRegistrationFormData {
  tryout_id: string;
  player_id: string;
  status?: RegistrationStatus; // 'confirmed' = selected, 'cancelled' = cut
  notes?: string;
}

// What gets stored in database (database format)
export interface TryoutRegistration extends TryoutRegistrationFormData {
  id: string;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

// Registration with player and tryout details (for JOIN queries)
export interface TryoutRegistrationWithDetails extends TryoutRegistration {
  player?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    position?: string;
    jersey_number?: number;
    phone?: string;
    birth_date?: string;
    parent_name?: string;
    parent_email?: string;
    parent_phone?: string;
    emergency_contact?: string;
    medical_notes?: string;
    is_active?: boolean;
  };
  tryout?: {
    id: string;
    name: string;
    description?: string;
    status?: string;
    level?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
  };
} 