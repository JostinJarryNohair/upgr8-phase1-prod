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
}: CreateEvaluationModalProps) {
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>(selectedPlayerId || "");
  const [scores, setScores] = useState<{ [criteriaId: string]: number }>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Load evaluation criteria
  useEffect(() => {
    const loadCriteria = async () => {
      const { data, error } = await supabase
        .from("evaluation_criteria")
        .select("*")
        .eq("is_active", true)
        .order("category, name_fr");

      if (error) {
        console.error("Error loading criteria:", error);
        return;
      }

      setCriteria(data || []);
      
      // Initialize scores with 0
      const initialScores: { [criteriaId: string]: number } = {};
      (data || []).forEach(criterion => {
        initialScores[criterion.id] = 0;
      });
      setScores(initialScores);
    };

    if (isOpen) {
      loadCriteria();
    }
  }, [isOpen]);

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

      // Create the evaluation
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

      // Create all the scores
      const scoresData = Object.entries(scores).map(([criteriaId, score]) => ({
        player_evaluation_id: evaluation.id,
        criteria_id: criteriaId,
        score: score,
      }));

      const { error: scoresError } = await supabase
        .from("evaluation_scores")
        .insert(scoresData);

      if (scoresError) {
        throw scoresError;
      }

      // Success!
      onEvaluationCreated();
      onClose();
      
      // Reset form
      setSelectedPlayer("");
      setScores({});
      setNotes("");

    } catch (error) {
      console.error("Error creating evaluation:", error);
      alert("Erreur lors de la création de l'évaluation");
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Créer une évaluation</span>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {categoryCriteria.map((criterion) => (
                      <div key={criterion.id} className="bg-white p-4 rounded-lg border shadow-sm">
                        <Label htmlFor={`score-${criterion.id}`} className="text-base font-medium text-gray-900 mb-3 block">
                          {criterion.name_fr}
                        </Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Input
                              id={`score-${criterion.id}`}
                              type="number"
                              min="0"
                              max="10"
                              value={scores[criterion.id] || 0}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange(criterion.id, parseInt(e.target.value) || 0)}
                              className="w-16 h-10 text-center font-semibold"
                            />
                            <span className="text-sm text-gray-500 font-medium">/ 10</span>
                          </div>
                          <div className="flex space-x-1">
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Score global de l&apos;évaluation</h4>
              <div className="flex items-center justify-center space-x-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <span className="text-4xl font-bold text-blue-600">
                  {calculateOverallScore()}/10
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
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
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer l&apos;évaluation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 