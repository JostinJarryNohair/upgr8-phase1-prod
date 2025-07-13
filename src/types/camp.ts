import { Database } from "./database";

export type CampLevel = Database["public"]["Enums"]["camp_level"];

// What is displayed to the user
export interface CampFormData {
  name: string;
  level: CampLevel;
  location: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}
// What gets stored in database
export interface Camp extends CampFormData {
  id: string;
  coachId: string;
  createdAt: string;
}
