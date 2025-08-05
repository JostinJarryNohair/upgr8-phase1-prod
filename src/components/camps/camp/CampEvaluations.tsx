"use client";

import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/player";
import { PlayerEvaluationWithScores } from "@/types/evaluation";
import { supabase } from "@/lib/supabase/client";
import { EvaluationsManagement } from "@/components/evaluations/EvaluationsManagement";
import { CreateEvaluationModal } from "@/components/evaluations/CreateEvaluationModal";
import { useRouter } from "next/navigation";

interface CampEvaluationsProps {
  campId: string;
}

export function CampEvaluations({ campId }: CampEvaluationsProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [evaluations, setEvaluations] = useState<PlayerEvaluationWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states for create/edit evaluation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>();
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | undefined>();

  const loadCampEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      // Load camp players
      const { data: registrationsData, error: registrationsError } = await supabase
        .from("camp_registrations")
        .select(`
          *,
          players (
            id,
            first_name,
            last_name,
            email,
            phone,
            birth_date,
            position,
            jersey_number,
            parent_name,
            parent_phone,
            parent_email,
            emergency_contact,
            medical_notes,
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq("camp_id", campId)
        .neq("status", "cancelled");

      if (registrationsError) {
        console.error("Error loading camp registrations:", registrationsError);
        setError("Error loading camp players");
        return;
      }

      // Transform to Player format
      const campPlayers: Player[] = (registrationsData || [])
        .filter(reg => reg.players)
        .map(reg => reg.players as Player);

      setPlayers(campPlayers);

      if (campPlayers.length === 0) {
        setEvaluations([]);
        return;
      }

      // Load evaluations for camp players
      const playerIds = campPlayers.map(p => p.id);
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from("player_evaluations")
        .select(`
          *,
          players!inner (
            id,
            first_name,
            last_name,
            position,
            jersey_number
          ),
          coaches!inner (
            id,
            first_name,
            last_name
          ),
          evaluation_scores (
            *,
            evaluation_criteria (*)
          )
        `)
        .in("player_id", playerIds)
        .eq("coach_id", user.id)
        .order("evaluation_date", { ascending: false });

      if (evaluationsError) {
        console.error("Error loading evaluations:", evaluationsError);
        setError("Error loading evaluations");
        return;
      }

      // Transform to PlayerEvaluationWithScores format
      const transformedEvaluations: PlayerEvaluationWithScores[] = (evaluationsData || []).map(evaluation => ({
        ...evaluation,
        player: {
          id: evaluation.players.id,
          first_name: evaluation.players.first_name,
          last_name: evaluation.players.last_name,
          position: evaluation.players.position,
          jersey_number: evaluation.players.jersey_number,
        },
        coach: {
          id: evaluation.coaches.id,
          first_name: evaluation.coaches.first_name,
          last_name: evaluation.coaches.last_name,
        },
        scores: evaluation.evaluation_scores.map((score: {
          id: string;
          criteria_id: string;
          player_evaluation_id: string;
          score: number;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          evaluation_criteria: {
            id: string;
            name_en: string;
            name_fr: string;
            category: string;
            max_score: number | null;
            is_active: boolean | null;
            created_at: string | null;
          };
        }) => ({
          ...score,
          criteria: score.evaluation_criteria,
        })),
      }));

      setEvaluations(transformedEvaluations);
    } catch (error) {
      console.error("Error loading camp evaluations:", error);
      setError("Error loading evaluations");
    } finally {
      setLoading(false);
    }
  }, [campId]);

  useEffect(() => {
    loadCampEvaluations();
  }, [loadCampEvaluations]);

  const handleCreateEvaluation = (playerId?: string) => {
    setSelectedPlayerId(playerId);
    setEditingEvaluationId(undefined);
    setIsCreateModalOpen(true);
  };

  const handleEditEvaluation = (evaluationId: string) => {
    // Find the evaluation to get the player ID
    const evaluation = evaluations.find(e => e.id === evaluationId);
    if (evaluation) {
      setSelectedPlayerId(evaluation.player_id);
      setEditingEvaluationId(evaluationId);
      setIsCreateModalOpen(true);
    }
  };

  const handleViewEvaluation = (evaluationId: string) => {
    router.push(`/coach-dashboard/evaluations/${evaluationId}`);
  };

  const handleEvaluationCreated = async () => {
    setIsCreateModalOpen(false);
    setSelectedPlayerId(undefined);
    setEditingEvaluationId(undefined);
    // Refresh evaluations after creation/edit
    await loadCampEvaluations();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-600">
          Loading camp evaluations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600 mb-4">{error}</div>
        <div className="text-center">
          <button
            onClick={loadCampEvaluations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Camp Context Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Camp Evaluations
        </h3>
        <p className="text-blue-700 text-sm">
          Evaluations for players registered in this camp ({players.length} players, {evaluations.length} evaluations)
        </p>
        <div className="mt-3 flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full"></div>
            <span className="text-green-700">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded-full animate-pulse"></div>
            <span className="text-orange-700">In Progress (click &ldquo;Continuer l&apos;évaluation&rdquo; to edit)</span>
          </div>
        </div>
      </div>

      {/* Evaluations Management */}
      <EvaluationsManagement
        players={players}
        evaluations={evaluations}
        onCreateEvaluation={handleCreateEvaluation}
        onViewEvaluation={handleViewEvaluation}
        onEditEvaluation={handleEditEvaluation}
      />

      {/* Create/Edit Evaluation Modal */}
      <CreateEvaluationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedPlayerId(undefined);
          setEditingEvaluationId(undefined);
        }}
        selectedPlayerId={selectedPlayerId}
        editingEvaluationId={editingEvaluationId}
        players={players}
        onEvaluationCreated={handleEvaluationCreated}
      />
    </div>
  );
}