import { z } from "zod";
import { Database } from "@/types/database";

// Extract the enums from the database types
type TryoutStatus = Database["public"]["Enums"]["tryout_status"];
type CampLevel = Database["public"]["Enums"]["camp_level"];

const TRYOUT_STATUSES: TryoutStatus[] = ["active", "completed", "cancelled"];

const CAMP_LEVELS: CampLevel[] = [
  "M13", "M15", "M18", 
  "U7", "U9", "U11", "U13", "U15", "U18",
  "Junior", "Senior"
];

// Tryout form validation schema
export const tryoutFormSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du tryout est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),
  
  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
  
  status: z
    .enum(TRYOUT_STATUSES as [TryoutStatus, ...TryoutStatus[]], {
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

// Tryout update schema (all fields optional)
export const tryoutUpdateSchema = tryoutFormSchema;

// Type inference from schemas
export type TryoutFormInput = z.infer<typeof tryoutFormSchema>;
export type TryoutUpdateInput = z.infer<typeof tryoutUpdateSchema>;