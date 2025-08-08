"use client";

import { useState } from "react";
import { Player } from "@/types/player";
import { PlayerEvaluationWithScores } from "@/types/evaluation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  ClipboardCheck,
  Star,
  FileText,
  X,
  Trash2
} from "lucide-react";

import { CreateEvaluationModal } from "./CreateEvaluationModal";
import { downloadEvaluationPDF } from "@/lib/pdfService";
import { supabase } from "@/lib/supabase/client";

interface EvaluationsManagementProps {
  players: Player[];
  evaluations: PlayerEvaluationWithScores[];
  onCreateEvaluation: (playerId: string) => void;
  onViewEvaluation: (evaluationId: string) => void;
  onEditEvaluation?: (evaluationId: string) => void;
}

export function EvaluationsManagement({
  players,
  evaluations,
  onCreateEvaluation,
  onViewEvaluation,
  onEditEvaluation,
}: EvaluationsManagementProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todo");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPlayerForEvaluation, setSelectedPlayerForEvaluation] = useState<string | undefined>();
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | undefined>();

  // Get players without evaluations (for "À faire" tab)
  const playersWithoutEvaluations = players.filter(player => 
    !evaluations.some(evaluation => evaluation.player_id === player.id)
  ).filter(player => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase().trim();
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const email = player.email?.toLowerCase() || '';
    return fullName.includes(search) || email.includes(search);
  });

  // Get completed evaluations (for "Complétées" tab)
  const completedEvaluations = evaluations.filter(evaluation => {
    if (!searchTerm.trim()) return evaluation.is_completed;
    const search = searchTerm.toLowerCase().trim();
    const fullName = `${evaluation.player.first_name} ${evaluation.player.last_name}`.toLowerCase();
    return evaluation.is_completed && fullName.includes(search);
  });

  // Get player initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get position label
  const getPositionLabel = (position: string | undefined) => {
    switch (position) {
      case "forward": return "Attaquant";
      case "defense": return "Défenseur";
      case "goalie": return "Gardien";
      default: return "Non défini";
    }
  };

  // Get position color
  const getPositionColor = (position: string | undefined) => {
    switch (position) {
      case "forward": return "bg-red-500";
      case "defense": return "bg-blue-500";
      case "goalie": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateEvaluation = (playerId?: string) => {
    setSelectedPlayerForEvaluation(playerId);
    setEditingEvaluationId(undefined); // Make sure we're in create mode
    setIsCreateModalOpen(true);
  };

  const handleEditEvaluation = (evaluationId: string) => {
    if (onEditEvaluation) {
      // Use external handler if provided
      onEditEvaluation(evaluationId);
    } else {
      // Fall back to internal handling
      const evaluation = evaluations.find(e => e.id === evaluationId);
      if (evaluation) {
        setSelectedPlayerForEvaluation(evaluation.player_id);
        setEditingEvaluationId(evaluationId);
        setIsCreateModalOpen(true);
      }
    }
  };

  const handleEvaluationCreated = () => {
    // Refresh the evaluations list
    onCreateEvaluation(selectedPlayerForEvaluation || "");
  };

  const handleDeleteEvaluation = async (evaluationId: string, playerName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'évaluation de ${playerName} ?`)) {
      try {
        const { error } = await supabase
          .from("player_evaluations")
          .delete()
          .eq("id", evaluationId);

        if (error) {
          console.error("Error deleting evaluation:", error);
          alert("Erreur lors de la suppression de l'évaluation");
          return;
        }

        // Refresh the evaluations list
        onCreateEvaluation(""); // Trigger parent to reload data
      } catch (error) {
        console.error("Error deleting evaluation:", error);
        alert("Erreur lors de la suppression de l'évaluation");
      }
    }
  };

  const handleExportPDF = (evaluation: PlayerEvaluationWithScores) => {
    try {
      downloadEvaluationPDF(evaluation, { language: 'fr' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Évaluations des joueurs</h1>
          <p className="text-gray-600 mt-1">
            {activeTab === "todo" 
              ? `${playersWithoutEvaluations.length} joueur${playersWithoutEvaluations.length !== 1 ? 's' : ''} à évaluer`
              : `${completedEvaluations.length} évaluation${completedEvaluations.length !== 1 ? 's' : ''} complétée${completedEvaluations.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Button
          onClick={() => handleCreateEvaluation()}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle évaluation
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 max-w-md"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute left-96 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
        <button
          onClick={() => setActiveTab("todo")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
            activeTab === "todo"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>À faire ({playersWithoutEvaluations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
            activeTab === "completed"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Complétées ({completedEvaluations.length})</span>
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "todo" ? (
        // Players to evaluate
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Joueurs à évaluer
            </h2>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-1">
                {playersWithoutEvaluations.length} résultat{playersWithoutEvaluations.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {playersWithoutEvaluations.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Aucun joueur trouvé" : "Tous les joueurs ont été évalués"}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "Ajustez votre recherche"
                  : "Félicitations! Vous avez évalué tous vos joueurs."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {playersWithoutEvaluations.map((player) => (
                <div
                  key={player.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getPositionColor(player.position)}`}>
                        {getInitials(player.first_name, player.last_name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {player.first_name} {player.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getPositionLabel(player.position)} {player.jersey_number ? `• #${player.jersey_number}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCreateEvaluation(player.id)}
                    size="sm"
                    className="w-full mt-3 bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Évaluer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Completed evaluations
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Évaluations complétées
            </h2>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-1">
                {completedEvaluations.length} résultat{completedEvaluations.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {completedEvaluations.length === 0 ? (
            <div className="p-8 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune évaluation complétée
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "Aucune évaluation ne correspond à votre recherche"
                  : "Commencez par évaluer vos joueurs dans l'onglet \"À faire\""
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Date d&apos;évaluation</TableHead>
                  <TableHead>Score global</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getPositionColor(evaluation.player.position || undefined)}`}>
                          {getInitials(evaluation.player.first_name, evaluation.player.last_name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {evaluation.player.first_name} {evaluation.player.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            #{evaluation.player.jersey_number || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPositionLabel(evaluation.player.position || undefined)}</TableCell>
                    <TableCell>{formatDate(evaluation.evaluation_date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round((evaluation.overall_score || 0))
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {evaluation.overall_score?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => handleCreateEvaluation(evaluation.player_id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Réévaluer
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewEvaluation(evaluation.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvaluation(evaluation.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportPDF(evaluation)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Exporter PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvaluation(
                                evaluation.id, 
                                `${evaluation.player.first_name} ${evaluation.player.last_name}`
                              )}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Create/Edit Evaluation Modal */}
      <CreateEvaluationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedPlayerForEvaluation(undefined);
          setEditingEvaluationId(undefined);
        }}
        selectedPlayerId={selectedPlayerForEvaluation}
        players={players}
        onEvaluationCreated={handleEvaluationCreated}
        editingEvaluationId={editingEvaluationId}
      />
    </div>
  );
}