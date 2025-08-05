"use client";

import { useState, useEffect } from "react";
import { Player } from "@/types/player";
import { EvaluationCriteria } from "@/types/evaluation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  X, 
  User, 
  Star, 
  Save,
  Loader2

} from "lucide-react";


interface CreateEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayerId?: string;
  players: Player[];
  onEvaluationCreated: () => void;
  editingEvaluationId?: string; // New prop for editing
}

const criteriaCategories = [
  { id: "technical", name: "Évaluation technique", color: "bg-blue-50 border-blue-200" },
  { id: "tactical", name: "Évaluation tactique", color: "bg-green-50 border-green-200" },
  { id: "mental", name: "Évaluation mentale", color: "bg-purple-50 border-purple-200" },
];

export function CreateEvaluationModal({
  isOpen,
  onClose,
  selectedPlayerId,
  players,
  onEvaluationCreated,
  editingEvaluationId,
}: CreateEvaluationModalProps) {
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>(selectedPlayerId || "");
  const [scores, setScores] = useState<{ [criteriaId: string]: number }>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Load evaluation criteria and existing evaluation data
  useEffect(() => {
    const loadData = async () => {
      // Load criteria
      const { data: criteriaData, error: criteriaError } = await supabase
        .from("evaluation_criteria")
        .select("*")
        .eq("is_active", true)
        .order("category, name_fr");

      if (criteriaError) {
        console.error("Error loading criteria:", criteriaError);
        return;
      }

      setCriteria(criteriaData || []);
      
      // Initialize scores
      const initialScores: { [criteriaId: string]: number } = {};
      (criteriaData || []).forEach(criterion => {
        initialScores[criterion.id] = 0;
      });

      // If editing, load existing evaluation data
      if (editingEvaluationId) {
        const { data: evaluationData, error: evaluationError } = await supabase
          .from("player_evaluations")
          .select(`
            *,
            evaluation_scores (
              criteria_id,
              score
            )
          `)
          .eq("id", editingEvaluationId)
          .single();

        if (evaluationError) {
          console.error("Error loading evaluation:", evaluationError);
        } else if (evaluationData) {
          // Load existing scores
          const existingScores = { ...initialScores };
          evaluationData.evaluation_scores?.forEach((score: {
            criteria_id: string;
            score: number;
          }) => {
            existingScores[score.criteria_id] = score.score;
          });
          
          setScores(existingScores);
          setNotes(evaluationData.notes || "");
          setSelectedPlayer(evaluationData.player_id);
        }
      } else {
        setScores(initialScores);
        setNotes("");
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, editingEvaluationId]);

  // Update selected player when prop changes
  useEffect(() => {
    if (selectedPlayerId) {
      setSelectedPlayer(selectedPlayerId);
    }
  }, [selectedPlayerId]);

  const handleScoreChange = (criteriaId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: Math.max(0, Math.min(10, score)) // Ensure score is between 0-10
    }));
  };

  const calculateOverallScore = () => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / Object.keys(scores).length;
    return Math.round(averageScore * 10) / 10; // Round to 1 decimal place
  };

  const handleSubmit = async () => {
    if (!selectedPlayer) {
      alert("Veuillez sélectionner un joueur");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }

      let evaluationId: string;

      if (editingEvaluationId) {
        console.log("Updating evaluation:", editingEvaluationId);
        
        // First, verify the evaluation exists and belongs to this coach
        const { data: existingEvaluation, error: fetchError } = await supabase
          .from("player_evaluations")
          .select("id, coach_id")
          .eq("id", editingEvaluationId)
          .single();

        if (fetchError) {
          console.error("Error fetching existing evaluation:", fetchError);
          throw new Error("Impossible de trouver l'évaluation à modifier");
        }

        if (existingEvaluation.coach_id !== user.id) {
          throw new Error("Vous n'avez pas la permission de modifier cette évaluation");
        }

        // Update existing evaluation
        const { data: evaluation, error: evaluationError } = await supabase
          .from("player_evaluations")
          .update({
            notes: notes,
            overall_score: calculateOverallScore(),
            is_completed: true,
          })
          .eq("id", editingEvaluationId)
          .eq("coach_id", user.id) // Add coach_id check for security
          .select()
          .single();

        if (evaluationError) {
          console.error("Error updating evaluation:", evaluationError);
          throw new Error(`Erreur lors de la mise à jour: ${evaluationError.message}`);
        }

        if (!evaluation) {
          throw new Error("Aucune évaluation mise à jour - vérifiez vos permissions");
        }

        evaluationId = evaluation.id;

        console.log("Successfully updated evaluation");
      } else {
        // Create new evaluation
        const { data: evaluation, error: evaluationError } = await supabase
          .from("player_evaluations")
          .insert({
            player_id: selectedPlayer,
            coach_id: user.id,
            evaluation_date: new Date().toISOString(),
            notes: notes,
            overall_score: calculateOverallScore(),
            is_completed: true,
          })
          .select()
          .single();

        if (evaluationError) {
          throw evaluationError;
        }

        evaluationId = evaluation.id;
      }

      // Create/update all the scores using UPSERT
      const scoresData = Object.entries(scores).map(([criteriaId, score]) => ({
        player_evaluation_id: evaluationId,
        criteria_id: criteriaId,
        score: score,
      }));

      console.log("Upserting scores:", scoresData.length, "scores");

      const { error: scoresError } = await supabase
        .from("evaluation_scores")
        .upsert(scoresData, {
          onConflict: 'player_evaluation_id,criteria_id', // Handle duplicates on this unique constraint
        });

      if (scoresError) {
        console.error("Error upserting scores:", scoresError);
        throw new Error(`Erreur lors de l'enregistrement des scores: ${scoresError.message}`);
      }

      console.log("Successfully upserted scores");

      // Success!
      onEvaluationCreated();
      onClose();
      
      // Reset form
      setSelectedPlayer("");
      setScores({});
      setNotes("");

    } catch (error) {
      console.error("Error saving evaluation:", error);
      
      // More specific error messages
      let errorMessage = editingEvaluationId 
        ? "Erreur lors de la modification de l'évaluation" 
        : "Erreur lors de la création de l'évaluation";
        
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
      // Reset form
      setSelectedPlayer("");
      setScores({});
      setNotes("");
    }
  };

  const getSelectedPlayer = () => {
    return players.find(p => p.id === selectedPlayer);
  };

  const getCriteriaByCategory = (category: string) => {
    return criteria.filter(c => c.category === category);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1400px] w-[90vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>{editingEvaluationId ? "Modifier une évaluation" : "Créer une évaluation"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Player Selection */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="space-y-3">
              <Label htmlFor="player-select" className="text-base font-medium">Joueur à évaluer</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner un joueur" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.first_name} {player.last_name}
                      {player.position && ` (${player.position})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getSelectedPlayer() && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white p-3 rounded border">
                  <User className="w-4 h-4" />
                  <span>Évaluant: {getSelectedPlayer()?.first_name} {getSelectedPlayer()?.last_name}</span>
                </div>
              )}
            </div>
          </div>

                    {/* Evaluation Criteria */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Critères d&apos;évaluation</h3>
              <p className="text-gray-600 mt-2">Évaluez chaque critère sur une échelle de 0 à 10</p>
            </div>
            
            {criteriaCategories.map((category) => {
              const categoryCriteria = getCriteriaByCategory(category.id);
              
              return (
                <div key={category.id} className={`p-6 rounded-xl border-2 ${category.color}`}>
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 text-center">{category.name}</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {categoryCriteria.map((criterion) => (
                      <div key={criterion.id} className="bg-white p-5 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                        <Label htmlFor={`score-${criterion.id}`} className="text-base font-medium text-gray-900 mb-4 block">
                          {criterion.name_fr}
                        </Label>
                        <div className="flex items-center justify-between space-x-4">
                          <div className="flex items-center space-x-2">
                            <Input
                              id={`score-${criterion.id}`}
                              type="number"
                              min="0"
                              max="10"
                              value={scores[criterion.id] || 0}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange(criterion.id, parseInt(e.target.value) || 0)}
                              className="w-20 h-12 text-center font-semibold text-lg"
                            />
                            <span className="text-base text-gray-500 font-medium">/ 10</span>
                          </div>
                          <div className="flex space-x-0.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleScoreChange(criterion.id, star)}
                                className={`w-5 h-5 transition-colors ${
                                  (scores[criterion.id] || 0) >= star 
                                    ? "text-yellow-500 hover:text-yellow-600" 
                                    : "text-gray-300 hover:text-gray-400"
                                }`}
                              >
                                <Star className="w-full h-full fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border-2 border-blue-200">
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Score global de l&apos;évaluation</h4>
              <div className="flex items-center justify-center space-x-4">
                <Star className="w-12 h-12 text-yellow-500" />
                <span className="text-6xl font-bold text-blue-600">
                  {calculateOverallScore()}/10
                </span>
              </div>
              <p className="text-base text-gray-600 mt-3">
                Moyenne calculée automatiquement sur tous les critères
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-base font-medium">Notes et observations</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez des commentaires détaillés sur l&apos;évaluation, les forces, les axes d&apos;amélioration..."
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                Ces notes seront visibles par l&apos;équipe de coaching
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6 border-t">
          <Button variant="outline" onClick={handleClose} disabled={saving} size="lg">
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !selectedPlayer} size="lg" className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {editingEvaluationId ? "Modification..." : "Enregistrement..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {editingEvaluationId ? "Modifier l'évaluation" : "Enregistrer l'évaluation"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 