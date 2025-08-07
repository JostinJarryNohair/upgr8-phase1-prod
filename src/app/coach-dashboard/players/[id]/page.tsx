"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Player } from "@/types/player";
import { PlayerEvaluationWithScores } from "@/types/evaluation";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromPlayerDatabaseFormat } from "@/lib/mappers/playerMapper";
import { fromEvaluationWithScoresDatabaseFormat } from "@/lib/mappers/evaluationMapper";
import { useTranslation } from '@/hooks/useTranslation';
import { CreateEvaluationModal } from "@/components/evaluations/CreateEvaluationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Star, 
  Plus, 
  Eye, 
  Edit, 
  TrendingUp,
  Award,
  Loader2
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function PlayerPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [evaluations, setEvaluations] = useState<PlayerEvaluationWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load player and evaluations
  useEffect(() => {
    const loadPlayerData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error(t('common.notAuthenticated'));
        setLoading(false);
        return;
      }

      // Load player details (only if belongs to this coach)
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .eq("coach_id", user.id)
        .single();

      if (playerError) {
        console.error("Error loading player:", playerError);
        setLoading(false);
        return;
      }

      const formattedPlayer = fromPlayerDatabaseFormat(playerData);
      setPlayer(formattedPlayer);

      // Load player evaluations
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
        .eq("player_id", playerId)
        .eq("coach_id", user.id)
        .order("evaluation_date", { ascending: false });

      if (evaluationsError) {
        console.error("Error loading evaluations:", evaluationsError);
      } else {
        const formattedEvaluations = (evaluationsData || []).map(fromEvaluationWithScoresDatabaseFormat);
        setEvaluations(formattedEvaluations);
      }

      setLoading(false);
    };

    if (playerId) {
      loadPlayerData();
    }
  }, [playerId, t]);

  const handleCreateEvaluation = () => {
    setIsCreateModalOpen(true);
  };

  const handleEvaluationCreated = () => {
    // Refresh evaluations
    loadEvaluations();
  };

  const loadEvaluations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

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
      .eq("player_id", playerId)
      .eq("coach_id", user.id)
      .order("evaluation_date", { ascending: false });

    if (evaluationsError) {
      console.error("Error loading evaluations:", evaluationsError);
    } else {
      const formattedEvaluations = (evaluationsData || []).map(fromEvaluationWithScoresDatabaseFormat);
      setEvaluations(formattedEvaluations);
    }
  };

  const getPositionColor = (position: string | undefined) => {
    switch (position) {
      case "forward": return "bg-red-500";
      case "defense": return "bg-blue-500";
      case "goalie": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPositionLabel = (position: string | undefined) => {
    switch (position) {
      case "forward": return "Attaquant";
      case "defense": return "Défenseur";
      case "goalie": return "Gardien";
      default: return "Non défini";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non défini";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAverageScore = () => {
    if (evaluations.length === 0) return 0;
    const totalScore = evaluations.reduce((sum, evaluation) => sum + (evaluation.overall_score || 0), 0);
    return Math.round((totalScore / evaluations.length) * 10) / 10;
  };

  const getLatestEvaluation = () => {
    return evaluations.length > 0 ? evaluations[0] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-gray-600">Chargement du joueur...</span>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Joueur non trouvé</h2>
                          <p className="text-gray-600 mb-4">Le joueur que vous recherchez n&apos;existe pas.</p>
          <Button onClick={() => router.push("/coach-dashboard/players")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux joueurs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push("/coach-dashboard/players")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${getPositionColor(player.position)}`}>
              {getInitials(player.first_name, player.last_name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {player.first_name} {player.last_name}
              </h1>
              <p className="text-gray-600">
                {getPositionLabel(player.position)}
                {player.jersey_number && ` • #${player.jersey_number}`}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={handleCreateEvaluation} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle évaluation
        </Button>
      </div>

      {/* Player Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{getPositionLabel(player.position)}</p>
              </div>
              {player.jersey_number && (
                <div>
                  <p className="text-sm text-gray-500">Numéro</p>
                  <p className="font-medium">#{player.jersey_number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{player.email}</p>
              </div>
              {player.phone && (
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{player.phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Évaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-blue-600">{evaluations.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Moyenne</p>
                <p className="font-medium">{calculateAverageScore()}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Dernière évaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {getLatestEvaluation() 
                    ? formatDate(getLatestEvaluation()!.evaluation_date)
                    : "Aucune"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Score</p>
                <p className="font-medium">
                  {getLatestEvaluation()?.overall_score 
                    ? `${getLatestEvaluation()!.overall_score}/10`
                    : "N/A"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Historique des évaluations
            </span>
            <Badge variant="secondary">
              {evaluations.length} évaluation{evaluations.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune évaluation
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer la première évaluation pour ce joueur.
              </p>
              <Button onClick={handleCreateEvaluation}>
                <Plus className="w-4 h-4 mr-2" />
                Créer une évaluation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Score global</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {formatDate(evaluation.evaluation_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {evaluation.overall_score ? (
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">
                            {evaluation.overall_score.toFixed(1)}/10
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Non calculé</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={evaluation.is_completed ? "default" : "secondary"}>
                        {evaluation.is_completed ? "Complétée" : "En cours"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {evaluation.notes ? 
                          evaluation.notes.length > 50 
                            ? `${evaluation.notes.substring(0, 50)}...` 
                            : evaluation.notes
                          : "Aucune note"
                        }
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Evaluation Modal */}
      <CreateEvaluationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedPlayerId={playerId}
        players={[player]}
        onEvaluationCreated={handleEvaluationCreated}
      />
    </div>
  );
}
