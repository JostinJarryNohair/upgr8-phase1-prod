import { 
  EvaluationCriteria, 
  PlayerEvaluation, 
  EvaluationScore,
  EvaluationCriteriaFormData,
  PlayerEvaluationFormData,
  EvaluationScoreFormData,
  PlayerEvaluationWithScores
} from "@/types/evaluation";

// Convert database format to frontend format
export function fromDatabaseFormat(data: EvaluationCriteria): EvaluationCriteriaFormData {
  return {
    id: data.id,
    category: data.category,
    name_fr: data.name_fr,
    name_en: data.name_en,
    max_score: data.max_score || 10,
    is_active: data.is_active || true,
  };
}

export function fromPlayerEvaluationDatabaseFormat(data: PlayerEvaluation): PlayerEvaluationFormData {
  return {
    id: data.id,
    player_id: data.player_id,
    coach_id: data.coach_id,
    evaluation_date: data.evaluation_date || new Date().toISOString(),
    notes: data.notes || "",
    overall_score: data.overall_score || undefined,
    is_completed: data.is_completed || false,
  };
}

export function fromEvaluationScoreDatabaseFormat(data: EvaluationScore): EvaluationScoreFormData {
  return {
    id: data.id,
    player_evaluation_id: data.player_evaluation_id,
    criteria_id: data.criteria_id,
    score: data.score,
    notes: data.notes || undefined,
  };
}

// Convert frontend format to database format
export function toDatabaseFormat(data: EvaluationCriteriaFormData): Partial<EvaluationCriteria> {
  return {
    id: data.id,
    category: data.category,
    name_fr: data.name_fr,
    name_en: data.name_en,
    max_score: data.max_score,
    is_active: data.is_active,
  };
}

export function toPlayerEvaluationDatabaseFormat(data: PlayerEvaluationFormData): Partial<PlayerEvaluation> {
  return {
    id: data.id,
    player_id: data.player_id,
    coach_id: data.coach_id,
    evaluation_date: data.evaluation_date,
    notes: data.notes,
    overall_score: data.overall_score,
    is_completed: data.is_completed,
  };
}

export function toEvaluationScoreDatabaseFormat(data: EvaluationScoreFormData): Partial<EvaluationScore> {
  return {
    id: data.id,
    player_evaluation_id: data.player_evaluation_id,
    criteria_id: data.criteria_id,
    score: data.score,
    notes: data.notes,
  };
}

          // Helper function to format evaluation with scores from database query
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     export function fromEvaluationWithScoresDatabaseFormat(data: any): PlayerEvaluationWithScores {
       return {
         id: data.id,
         player_id: data.player_id,
         coach_id: data.coach_id,
         evaluation_date: data.evaluation_date,
         notes: data.notes,
         overall_score: data.overall_score,
         is_completed: data.is_completed,
         created_at: data.created_at,
         updated_at: data.updated_at,
         scores: data.scores || [],
         player: data.player || {},
         coach: data.coach || {},
       };
     } 