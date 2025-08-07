import { z } from "zod";
import { Database } from "@/types/database";

// Extract the player_position enum from the database types
type PlayerPosition = Database["public"]["Enums"]["player_position"];

const PLAYER_POSITIONS: PlayerPosition[] = ["forward", "defense", "goalie"];

// Player form validation schema
export const playerFormSchema = z.object({
  first_name: z
    .string()
    .min(1, "Le prénom est requis")
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .trim(),
  
  last_name: z
    .string()
    .min(1, "Le nom de famille est requis")
    .min(2, "Le nom de famille doit contenir au moins 2 caractères")
    .max(50, "Le nom de famille ne peut pas dépasser 50 caractères")
    .trim(),
  
  email: z
    .string()
    .email("Format d'email invalide")
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .regex(/^(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 
           "Format de téléphone invalide")
    .optional()
    .or(z.literal("")),
  
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
    .optional()
    .or(z.literal("")),
  
  position: z
    .enum(PLAYER_POSITIONS as [PlayerPosition, ...PlayerPosition[]])
    .optional(),
  
  jersey_number: z
    .number()
    .int("Le numéro de chandail doit être un entier")
    .min(1, "Le numéro de chandail doit être supérieur à 0")
    .max(99, "Le numéro de chandail ne peut pas dépasser 99")
    .optional(),
  
  parent_name: z
    .string()
    .min(2, "Le nom du parent doit contenir au moins 2 caractères")
    .max(100, "Le nom du parent ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  
  parent_phone: z
    .string()
    .regex(/^(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 
           "Format de téléphone invalide")
    .optional()
    .or(z.literal("")),
  
  parent_email: z
    .string()
    .email("Format d'email invalide")
    .optional()
    .or(z.literal("")),
  
  emergency_contact: z
    .string()
    .max(200, "Le contact d'urgence ne peut pas dépasser 200 caractères")
    .optional()
    .or(z.literal("")),
  
  medical_notes: z
    .string()
    .max(500, "Les notes médicales ne peuvent pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
  
  is_active: z
    .boolean()
    .optional()
    .default(true)
});

// Player update schema (all fields optional)
export const playerUpdateSchema = playerFormSchema.partial();

// Type inference from schemas
export type PlayerFormInput = z.infer<typeof playerFormSchema>;
export type PlayerUpdateInput = z.infer<typeof playerUpdateSchema>;