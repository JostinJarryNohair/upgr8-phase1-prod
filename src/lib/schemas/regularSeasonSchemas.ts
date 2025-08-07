import { z } from "zod";
import { Database } from "@/types/database";

// Extract the enums from the database types
type RegularSeasonStatus = Database["public"]["Enums"]["regular_season_status"];
type CampLevel = Database["public"]["Enums"]["camp_level"];

const REGULAR_SEASON_STATUSES: RegularSeasonStatus[] = ["active", "completed", "cancelled"];

const CAMP_LEVELS: CampLevel[] = [
  "M13", "M15", "M18", 
  "U7", "U9", "U11", "U13", "U15", "U18",
  "Junior", "Senior"
];

// Regular season form validation schema
export const regularSeasonFormSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom de la saison est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),
  
  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
  
  status: z
    .enum(REGULAR_SEASON_STATUSES as [RegularSeasonStatus, ...RegularSeasonStatus[]], {
      required_error: "Le statut est requis",
      invalid_type_error: "Statut invalide"
    }),
  
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
    .optional()
    .or(z.literal("")),
  
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
    .optional()
    .or(z.literal("")),
  
  location: z
    .string()
    .max(200, "Le lieu ne peut pas dépasser 200 caractères")
    .optional()
    .or(z.literal("")),
  
  level: z
    .enum(CAMP_LEVELS as [CampLevel, ...CampLevel[]])
    .optional()
})
.refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "La date de fin doit être après la date de début",
  path: ["end_date"]
});

// Regular season update schema (all fields optional except the validation)
export const regularSeasonUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim()
    .optional(),
  
  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional(),
  
  status: z
    .enum(REGULAR_SEASON_STATUSES as [RegularSeasonStatus, ...RegularSeasonStatus[]])
    .optional(),
  
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
    .optional(),
  
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
    .optional(),
  
  location: z
    .string()
    .max(200, "Le lieu ne peut pas dépasser 200 caractères")
    .optional(),
  
  level: z
    .enum(CAMP_LEVELS as [CampLevel, ...CampLevel[]])
    .optional()
})
.refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "La date de fin doit être après la date de début",
  path: ["end_date"]
});

// Regular season player validation schema
export const regularSeasonPlayerSchema = z.object({
  regular_season_id: z
    .string()
    .min(1, "L'ID de la saison est requis"),
  
  player_id: z
    .string()
    .min(1, "L'ID du joueur est requis"),
  
  status: z
    .enum(["active", "inactive", "injured", "suspended"] as const)
    .default("active"),
  
  notes: z
    .string()
    .max(500, "Les notes ne peuvent pas dépasser 500 caractères")
    .optional()
    .or(z.literal(""))
});

// Type inference from schemas
export type RegularSeasonFormInput = z.infer<typeof regularSeasonFormSchema>;
export type RegularSeasonUpdateInput = z.infer<typeof regularSeasonUpdateSchema>;
export type RegularSeasonPlayerInput = z.infer<typeof regularSeasonPlayerSchema>;