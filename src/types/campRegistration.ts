import { Database } from "./database";

export type RegistrationStatus =
  Database["public"]["Enums"]["registration_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

// What is displayed to the user
export interface CampRegistrationFormData {
  camp_id: string;
  player_id: string;
  status?: RegistrationStatus;
  payment_status?: PaymentStatus;
  notes?: string;
}

// What gets stored in database
export interface CampRegistration extends CampRegistrationFormData {
  id: string;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

// Registration with player and camp details
export interface CampRegistrationWithDetails extends CampRegistration {
  player?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    position?: string;
    jersey_number?: number;
  };
  camp?: {
    id: string;
    name: string;
    level?: string;
    start_date?: string;
    end_date?: string;
  };
}
