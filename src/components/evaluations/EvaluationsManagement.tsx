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
  User,
  ClipboardCheck,
  Calendar,
  Star,
  Filter,
  FileText
} from "lucide-react";

import { CreateEvaluationModal } from "./CreateEvaluationModal";
import { downloadEvaluationPDF } from "@/lib/pdfService";

interface EvaluationsManagementProps {
  players: Player[];
  evaluations: PlayerEvaluationWithScores[];
  onCreateEvaluation: (playerId: string) => void;
  onViewEvaluation: (evaluationId: string) => void;
  onEditEvaluation: (evaluationId: string) => void;
}

const categories = [
  { id: "all", name: "Toutes les évaluations", count: 0, active: true },
  { id: "recent", name: "Évaluations récentes", count: 0, active: false },
  { id: "completed", name: "Évaluations complétées", count: 0, active: false },
  { id: "pending", name: "Évaluations en cours", count: 0, active: false },
];

const positions = [
  { id: "forward", name: "Attaquants", initial: "F", color: "bg-red-500", count: 0 },
  { id: "defense", name: "Défenseurs", initial: "D", color: "bg-blue-500", count: 0 },
  { id: "goalie", name: "Gardiens", initial: "G", color: "bg-green-500", count: 0 },
];

export function EvaluationsManagement({
  players,
  evaluations,
  onCreateEvaluation,
  onViewEvaluation,
  onEditEvaluation,
}: EvaluationsManagementProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [showPlayersWithoutEvaluations, setShowPlayersWithoutEvaluations] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPlayerForEvaluation, setSelectedPlayerForEvaluation] = useState<string | undefined>();

  // Calculate counts for categories and positions
  const calculateCounts = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const categoryCounts = categories.map(cat => {
      let count = 0;
      switch (cat.id) {
        case "all":
          count = evaluations.length;
          break;
        case "recent":
          count = evaluations.filter(e => e.evaluation_date && new Date(e.evaluation_date) > oneMonthAgo).length;
          break;
        case "completed":
          count = evaluations.filter(e => e.is_completed).length;
          break;
        case "pending":
          count = evaluations.filter(e => !e.is_completed).length;
          break;
      }
      return { ...cat, count, active: cat.id === selectedCategory };
    });

    const positionCounts = positions.map(pos => ({
      ...pos,
      count: players.filter(p => p.position === pos.id).length
    }));

    return { categoryCounts, positionCounts };
  };

  const { categoryCounts, positionCounts } = calculateCounts();

  // Get players without evaluations
  const playersWithoutEvaluations = players.filter(player => 
    !evaluations.some(evaluation => evaluation.player_id === player.id)
  );

  // Filter evaluations based on search and filters
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.player.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = !selectedPosition || evaluation.player.position === selectedPosition;
    const matchesCategory = selectedCategory === "all" || 
                           (selectedCategory === "recent" && evaluation.evaluation_date && new Date(evaluation.evaluation_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                           (selectedCategory === "completed" && evaluation.is_completed) ||
                           (selectedCategory === "pending" && !evaluation.is_completed);
    
    return matchesSearch && matchesPosition && matchesCategory;
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
    setIsCreateModalOpen(true);
  };

  const handleEvaluationCreated = () => {
    // Refresh the evaluations list
    onCreateEvaluation(selectedPlayerForEvaluation || "");
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des évaluations</h1>
          <p className="text-gray-600 mt-1">
            {evaluations.length} évaluation{evaluations.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowPlayersWithoutEvaluations(!showPlayersWithoutEvaluations)}
            variant="outline"
            size="sm"
          >
            <User className="w-4 h-4 mr-2" />
            {showPlayersWithoutEvaluations ? "Masquer" : "Afficher"} joueurs sans évaluation
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un joueur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Position
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedPosition(null)}>
                Toutes les positions
              </DropdownMenuItem>
              {positionCounts.map((position) => (
                <DropdownMenuItem 
                  key={position.id}
                  onClick={() => setSelectedPosition(position.id)}
                >
                  {position.name} ({position.count})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {categoryCounts.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              category.active
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Players without evaluations */}
      {showPlayersWithoutEvaluations && playersWithoutEvaluations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Joueurs sans évaluation ({playersWithoutEvaluations.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playersWithoutEvaluations.slice(0, 6).map((player) => (
              <div
                key={player.id}
                className="bg-white rounded-lg p-3 border border-blue-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getPositionColor(player.position || undefined)}`}>
                     {getInitials(player.first_name, player.last_name)}
                   </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {player.first_name} {player.last_name}
                    </p>
                                         <p className="text-sm text-gray-500">
                       {getPositionLabel(player.position || undefined)}
                     </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleCreateEvaluation(player.id)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Évaluer
                </Button>
              </div>
            ))}
          </div>
          {playersWithoutEvaluations.length > 6 && (
            <p className="text-sm text-blue-600 mt-3 text-center">
              +{playersWithoutEvaluations.length - 6} autres joueurs sans évaluation
            </p>
          )}
        </div>
      )}

      {/* Evaluations Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Évaluations récentes
          </h2>
        </div>
        
        {filteredEvaluations.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune évaluation trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedPosition || selectedCategory !== "all" 
                ? "Ajustez vos critères de recherche"
                : "Commencez par évaluer vos premiers joueurs"
              }
            </p>
            {!searchTerm && !selectedPosition && selectedCategory === "all" && (
              <Button onClick={() => handleCreateEvaluation()}>
                <Plus className="w-4 h-4 mr-2" />
                Créer une évaluation
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date d&apos;évaluation</TableHead>
                <TableHead>Score global</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.map((evaluation) => (
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
                        {evaluation.player.jersey_number && (
                          <p className="text-sm text-gray-500">
                            #{evaluation.player.jersey_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {getPositionLabel(evaluation.player.position || undefined)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(evaluation.evaluation_date)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {evaluation.overall_score ? (
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-900">
                          {evaluation.overall_score.toFixed(1)}/10
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Non calculé</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      evaluation.is_completed
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {evaluation.is_completed ? "Complétée" : "En cours"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewEvaluation(evaluation.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditEvaluation(evaluation.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportPDF(evaluation)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Exporter PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Evaluation Modal */}
      <CreateEvaluationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedPlayerId={selectedPlayerForEvaluation}
        players={players}
        onEvaluationCreated={handleEvaluationCreated}
      />
    </div>
  );
} 