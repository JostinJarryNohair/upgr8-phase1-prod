"use client";

import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/player";
import { PlayerEvaluationWithScores } from "@/types/evaluation";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromPlayerDatabaseFormat } from "@/lib/mappers/playerMapper";
import { fromEvaluationWithScoresDatabaseFormat } from "@/lib/mappers/evaluationMapper";
import { useTranslation } from '@/hooks/useTranslation';
import { EvaluationsManagement } from "@/components/evaluations/EvaluationsManagement";

export default function EvaluationsPage() {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [evaluations, setEvaluations] = useState<PlayerEvaluationWithScores[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvaluations = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error(t('common.notAuthenticated'));
      return;
    }

    // Load evaluations with scores, player, and coach details
    const { data: evaluationsData, error: evaluationsError } = await supabase
      .from("player_evaluations")
      .select(`
        *,
        scores:evaluation_scores(
          *,
          criteria:evaluation_criteria(*)
        ),
        player:players(id, first_name, last_name, position, jersey_number),
        coach:coaches(id, first_name, last_name)
      `)
      .eq("coach_id", user.id)
      .order("evaluation_date", { ascending: false });

    if (evaluationsError) {
      console.error("Error loading evaluations:", evaluationsError);
    } else {
      const formattedEvaluations = (evaluationsData || []).map(fromEvaluationWithScoresDatabaseFormat);
      setEvaluations(formattedEvaluations);
    }
  }, [t]);

  // Load players and evaluations from database
  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error(t('common.notAuthenticated'));
        setLoading(false);
        return;
      }

      // Load players for this coach
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (playersError) {
        console.error("Error loading players:", playersError);
      } else {
        const formattedPlayers = (playersData || []).map(fromPlayerDatabaseFormat);
        setPlayers(formattedPlayers);
      }

      // Load evaluations
      await loadEvaluations();

      setLoading(false);
    };

    loadData();
  }, [t, loadEvaluations]);

  const handleCreateEvaluation = () => {
    // Refresh evaluations data after creation
    loadEvaluations();
  };

  const handleViewEvaluation = (evaluationId: string) => {
    // TODO: Open evaluation details modal
    console.log("View evaluation:", evaluationId);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Chargement des évaluations...</div>
      </div>
    );
  }

  return (
    <EvaluationsManagement
      players={players}
      evaluations={evaluations}
      onCreateEvaluation={handleCreateEvaluation}
      onViewEvaluation={handleViewEvaluation}
    />
  );
} 