import { Database } from "./database";

// Database types (from generated Supabase types)
export type EvaluationCriteria = Database["public"]["Tables"]["evaluation_criteria"]["Row"];
export type PlayerEvaluation = Database["public"]["Tables"]["player_evaluations"]["Row"];
export type EvaluationScore = Database["public"]["Tables"]["evaluation_scores"]["Row"];

// Frontend types (for forms and components)
export interface EvaluationCriteriaFormData {
  id?: string;
  category: string;
  name_fr: string;
  name_en: string;
  max_score: number;
  is_active: boolean;
}

export interface PlayerEvaluationFormData {
  id?: string;
  player_id: string;
  coach_id: string;
  evaluation_date: string;
  notes: string;
  overall_score?: number;
  is_completed: boolean;
}

export interface EvaluationScoreFormData {
  id?: string;
  player_evaluation_id: string;
  criteria_id: string;
  score: number;
  notes?: string;
}

// Combined types for UI
export interface PlayerEvaluationWithScores extends PlayerEvaluation {
  scores: EvaluationScoreWithCriteria[];
  player: {
    id: string;
    first_name: string;
    last_name: string;
    position: string | null;
    jersey_number: number | null;
  };
  coach: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface EvaluationScoreWithCriteria extends EvaluationScore {
  criteria: EvaluationCriteria;
}

// Form data for creating new evaluation
export interface CreateEvaluationFormData {
  player_id: string;
  notes: string;
  scores: {
    [criteriaId: string]: number;
  };
}

// Evaluation summary for lists
export interface EvaluationSummary {
  id: string;
  player_name: string;
  player_position: string | null;
  evaluation_date: string;
  overall_score: number | null;
  is_completed: boolean;
  criteria_count: number;
} 