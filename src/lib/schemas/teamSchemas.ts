import { z } from "zod";
import { Database } from "@/types/database";

// Extract the camp_level enum from the database types
type CampLevel = Database["public"]["Enums"]["camp_level"];

// Define the camp levels array for validation
const CAMP_LEVELS: CampLevel[] = [
  "M13",
  "M15",
  "M18",
  "U7",
  "U9",
  "U11",
  "U13",
  "U15",
  "U18",
  "Junior",
  "Senior"
];

// Team form validation schema
export const teamFormSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom de l'équipe est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),
  
  level: z
    .enum(CAMP_LEVELS as [CampLevel, ...CampLevel[]], {
      required_error: "Le niveau est requis",
      invalid_type_error: "Niveau invalide"
    })
});

// Team update schema (all fields optional)
export const teamUpdateSchema = teamFormSchema.partial();

// Type inference from schemas
export type TeamFormInput = z.infer<typeof teamFormSchema>;
export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>;