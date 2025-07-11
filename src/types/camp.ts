export type CampLevel =
  | "M13"
  | "M15"
  | "M18"
  | "U7"
  | "U9"
  | "U11"
  | "U13"
  | "U15"
  | "U18"
  | "Junior"
  | "Senior";

export interface Camp {
  id: string;
  name: string;
  level: CampLevel;
  location: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}
