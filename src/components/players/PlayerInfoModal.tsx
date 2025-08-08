"use client";

import { useState } from "react";
import { Player } from "@/types/player";
import { PlayerEvaluationWithScores } from "@/types/evaluation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CreateEvaluationModal } from "@/components/evaluations/CreateEvaluationModal";
import { 
  X, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  TrendingUp,
  Clock,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Star,
  Plus
} from "lucide-react";

interface PlayerInfoModalProps {
  player: Player | null;
  evaluations: PlayerEvaluationWithScores[];
  isOpen: boolean;
  onClose: () => void;
  onEvaluationCreated?: () => void;
}

export function PlayerInfoModal({ player, evaluations, isOpen, onClose, onEvaluationCreated }: PlayerInfoModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateEvaluationModalOpen, setIsCreateEvaluationModalOpen] = useState(false);

  if (!isOpen || !player) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getPositionLabel = (position: string | undefined) => {
    switch (position) {
      case "forward":
        return "Centre";
      case "defense":
        return "Défenseur";
      case "goalie":
        return "Gardien";
      default:
        return "Non spécifié";
    }
  };

  const getPositionColor = (position: string | undefined) => {
    switch (position) {
      case "forward":
        return "bg-red-500";
      case "defense":
        return "bg-blue-500";
      case "goalie":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="relative bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-6">
            {/* Player Avatar */}
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white/20">
              {getInitials(player.first_name, player.last_name)}
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {player.first_name} {player.last_name}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4 text-red-400">
                <div className="flex items-center space-x-1">
                  <div className={`w-4 h-4 rounded-full ${getPositionColor(player.position)}`}></div>
                  <span>{getPositionLabel(player.position)} | #{player.jersey_number || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-none h-auto p-0 w-full justify-start">
              <TabsTrigger 
                value="overview" 
                className="bg-transparent text-gray-400 hover:text-white data-[state=active]:text-cyan-400 data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 rounded-none px-6 py-4"
              >
                Vue d&apos;ensemble
              </TabsTrigger>
    
              <TabsTrigger 
                value="evaluation" 
                className="bg-transparent text-gray-400 hover:text-white data-[state=active]:text-cyan-400 data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 rounded-none px-6 py-4"
              >
                Évaluation
              </TabsTrigger>
     

            </TabsList>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <TabsContent value="overview" className="mt-0">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Informations personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Nom complet</span>
                        <span className="text-white font-medium">
                          {player.first_name} {player.last_name}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Date de naissance</span>
                        <span className="text-white font-medium">
                          {player.birth_date ? new Date(player.birth_date).toLocaleDateString() : "-"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Âge</span>
                        <span className="text-white font-medium">{calculateAge(player.birth_date)} ans</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Position</span>
                        <span className="text-white font-medium">{getPositionLabel(player.position)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Numéro</span>
                        <span className="text-white font-medium">#{player.jersey_number || "N/A"}</span>
                      </div>

                      {player.email && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </span>
                          <span className="text-white font-medium">{player.email}</span>
                        </div>
                      )}

                      {player.phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Téléphone
                          </span>
                          <span className="text-white font-medium">{player.phone}</span>
                        </div>
                      )}

                      {player.parent_name && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Parent/Tuteur</span>
                          <span className="text-white font-medium">{player.parent_name}</span>
                        </div>
                      )}

                      {player.parent_email && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Email parent</span>
                          <span className="text-white font-medium">{player.parent_email}</span>
                        </div>
                      )}

                      {player.parent_phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Téléphone parent</span>
                          <span className="text-white font-medium">{player.parent_phone}</span>
                        </div>
                      )}

                      {player.emergency_contact && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Contact d&apos;urgence</span>
                          <span className="text-white font-medium">{player.emergency_contact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medical Notes */}
                  {player.medical_notes && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-white">Notes médicales</h3>
                      <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-yellow-200">{player.medical_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Statut</h3>
                    <Badge className={player.is_active ? "bg-green-600" : "bg-red-600"}>
                      {player.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="statistics" className="mt-0">
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Statistiques détaillées</h3>
                  <p className="text-gray-400">Cette section contiendra les statistiques complètes du joueur.</p>
                </div>
              </TabsContent>

              <TabsContent value="evaluation" className="mt-0">
                {evaluations && evaluations.length > 0 ? (
                  <div className="space-y-6">
                    {/* Evaluations Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-800 rounded-lg p-4 text-center border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {evaluations.length}
                        </div>
                        <div className="text-sm text-gray-400">Évaluations Total</div>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-4 text-center border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {evaluations.filter(e => e.is_completed).length}
                        </div>
                        <div className="text-sm text-gray-400">Complétées</div>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-4 text-center border border-orange-500/20">
                        <div className="text-2xl font-bold text-orange-400 mb-1">
                          {evaluations.length > 0 ? 
                            Math.round(evaluations.reduce((acc, e) => acc + (e.overall_score || 0), 0) / evaluations.length) : 0
                          }%
                        </div>
                        <div className="text-sm text-gray-400">Score Moyen</div>
                      </div>
                    </div>

                    {/* Evaluations List */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white mb-4">Historique des évaluations</h3>
                      {evaluations.map((evaluation) => (
                        <div 
                          key={evaluation.id} 
                          className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <span className="text-white font-medium">
                                  {evaluation.evaluation_date 
                                    ? new Date(evaluation.evaluation_date).toLocaleDateString()
                                    : "Date non spécifiée"
                                  }
                                </span>
                                {evaluation.is_completed ? (
                                  <Badge className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Complétée
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-600 hover:bg-orange-700">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    En cours
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {evaluation.coach?.first_name} {evaluation.coach?.last_name || "Coach"}
                                  </span>
                                </div>
                                {evaluation.overall_score && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4" />
                                    <span>Score: {evaluation.overall_score}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {evaluation.overall_score && (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-white mb-1">
                                  {evaluation.overall_score}%
                                </div>
                                <Progress 
                                  value={evaluation.overall_score} 
                                  className="w-20 h-2"
                                />
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {evaluation.notes && (
                            <div className="mb-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-300">Notes:</span>
                              </div>
                              <p className="text-gray-400 text-sm bg-gray-900 p-3 rounded">
                                {evaluation.notes}
                              </p>
                            </div>
                          )}

                          {/* Scores by Category */}
                          {evaluation.scores && evaluation.scores.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-3">
                                <BarChart3 className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-300">Détail des compétences:</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {evaluation.scores.map((score) => (
                                  <div key={score.id} className="bg-gray-900 rounded p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm text-gray-300">
                                        {score.criteria?.name_fr || score.criteria?.name_en || "Critère"}
                                      </span>
                                      <span className="text-sm font-medium text-white">
                                        {score.score}/{score.criteria?.max_score || 10}
                                      </span>
                                    </div>
                                    <Progress 
                                      value={(score.score / (score.criteria?.max_score || 10)) * 100} 
                                      className="h-1.5"
                                    />
                                    {score.notes && (
                                      <p className="text-xs text-gray-400 mt-2">{score.notes}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Aucune évaluation</h3>
                    <p className="text-gray-400">Ce joueur n&apos;a pas encore d&apos;évaluations enregistrées.</p>
                    <Button 
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setIsCreateEvaluationModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une évaluation
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="development" className="mt-0">
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Plan de développement</h3>
                  <p className="text-gray-400">Cette section contiendra le plan de développement du joueur.</p>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Historique</h3>
                  <p className="text-gray-400">Cette section contiendra l&apos;historique du joueur.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      
      {/* Create Evaluation Modal */}
      <CreateEvaluationModal
        isOpen={isCreateEvaluationModalOpen}
        onClose={() => setIsCreateEvaluationModalOpen(false)}
        selectedPlayerId={player?.id}
        players={player ? [player] : []}
        onEvaluationCreated={() => {
          setIsCreateEvaluationModalOpen(false);
          if (onEvaluationCreated) {
            onEvaluationCreated();
          }
        }}
      />
    </div>
  );
}