"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  X, 
  Target, 
  Users, 
  Shield,
  Zap,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";

interface GamePlan {
  id: string;
  matchId: string;
  formation: string;
  objectives: string[];
  keyPlayers: {
    player: string;
    role: string;
    instructions: string;
  }[];
  tactics: {
    offensive: string;
    defensive: string;
    specialSituations: string;
  };
  opponentAnalysis: {
    strengths: string[];
    weaknesses: string[];
    keyThreats: string[];
  };
  notes: string;
}

interface GamePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchTitle: string;
  opponent: string;
  date: string;
  time: string;
  existingPlan?: GamePlan;
  onSave: (plan: GamePlan) => void;
}

// Mock data for a sample game plan
const mockGamePlan: GamePlan = {
  id: "gp-1",
  matchId: "match-1",
  formation: "2-1-2",
  objectives: [
    "Contrôler le centre de la patinoire",
    "Exploiter les flancs en attaque",
    "Maintenir une défense compacte"
  ],
  keyPlayers: [
    {
      player: "Antoine Dubois (#12)",
      role: "Centre offensif",
      instructions: "Créer du jeu, distribuer les passes, tirer au but quand l&apos;occasion se présente"
    },
    {
      player: "Marie Tremblay (#8)",
      role: "Défenseur clé",
      instructions: "Organiser la défense, relancer proprement, couvrir les contre-attaques"
    },
    {
      player: "Lucas Martin (#23)",
      role: "Ailier droit",
      instructions: "Exploiter la vitesse sur les flancs, centrer pour les attaquants"
    }
  ],
  tactics: {
    offensive: "Jeu de passes courtes pour progresser, chercher les espaces sur les flancs, tirer de loin si l&apos;occasion se présente",
    defensive: "Pressing haut pour récupérer le puck rapidement, replier en bloc compact si nécessaire",
    specialSituations: "Jeu de puissance: formation 1-3-1. Infériorité numérique: formation en losange"
  },
  opponentAnalysis: {
    strengths: ["Jeu physique", "Gardien expérimenté", "Transitions rapides"],
    weaknesses: ["Faible sur les flancs", "Vulnérable aux tirs de loin", "Discipline défaillante"],
    keyThreats: ["#10 - Simon Lafleur (meilleur buteur)", "#5 - Paul Richard (défenseur physique)"]
  },
  notes: "L&apos;équipe adverse joue un style très physique. Nos joueurs doivent rester disciplinés et éviter les pénalités. Exploiter leur faiblesse défensive sur les flancs."
};

export function GamePlanModal({ 
  isOpen, 
  onClose, 
  matchTitle, 
  opponent, 
  date, 
  time,
  existingPlan,
  onSave 
}: GamePlanModalProps) {
  const [gamePlan, setGamePlan] = useState<GamePlan>(
    existingPlan || mockGamePlan
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'tactics' | 'players' | 'opponent'>('overview');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(gamePlan);
    onClose();
  };

  const addObjective = () => {
    setGamePlan({
      ...gamePlan,
      objectives: [...gamePlan.objectives, ""]
    });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...gamePlan.objectives];
    newObjectives[index] = value;
    setGamePlan({
      ...gamePlan,
      objectives: newObjectives
    });
  };

  const removeObjective = (index: number) => {
    setGamePlan({
      ...gamePlan,
      objectives: gamePlan.objectives.filter((_, i) => i !== index)
    });
  };

  const addKeyPlayer = () => {
    setGamePlan({
      ...gamePlan,
      keyPlayers: [...gamePlan.keyPlayers, { player: "", role: "", instructions: "" }]
    });
  };

  const updateKeyPlayer = (index: number, field: keyof typeof gamePlan.keyPlayers[0], value: string) => {
    const newKeyPlayers = [...gamePlan.keyPlayers];
    newKeyPlayers[index] = { ...newKeyPlayers[index], [field]: value };
    setGamePlan({
      ...gamePlan,
      keyPlayers: newKeyPlayers
    });
  };

  const removeKeyPlayer = (index: number) => {
    setGamePlan({
      ...gamePlan,
      keyPlayers: gamePlan.keyPlayers.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Plan de Match</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="font-semibold">{matchTitle}</span>
              <Badge className="bg-blue-100 text-blue-800">vs {opponent}</Badge>
              <span>{date} à {time}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Aperçu', icon: Target },
              { id: 'tactics', label: 'Tactiques', icon: Zap },
              { id: 'players', label: 'Joueurs Clés', icon: Users },
              { id: 'opponent', label: 'Adversaire', icon: Shield }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as "tactics" | "opponent" | "overview" | "players")}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="formation">Formation de Base</Label>
                <Input
                  id="formation"
                  value={gamePlan.formation}
                  onChange={(e) => setGamePlan({ ...gamePlan, formation: e.target.value })}
                  placeholder="Ex: 2-1-2, 1-2-2, etc."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Objectifs du Match</Label>
                  <Button onClick={addObjective} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2">
                  {gamePlan.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={objective}
                        onChange={(e) => updateObjective(index, e.target.value)}
                        placeholder="Objectif tactique..."
                      />
                      <Button
                        onClick={() => removeObjective(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes Générales</Label>
                <Textarea
                  id="notes"
                  value={gamePlan.notes}
                  onChange={(e) => setGamePlan({ ...gamePlan, notes: e.target.value })}
                  placeholder="Notes importantes, consignes particulières..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {activeTab === 'tactics' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Tactiques Offensives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={gamePlan.tactics.offensive}
                    onChange={(e) => setGamePlan({
                      ...gamePlan,
                      tactics: { ...gamePlan.tactics, offensive: e.target.value }
                    })}
                    placeholder="Stratégies d'attaque, schémas de jeu..."
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Tactiques Défensives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={gamePlan.tactics.defensive}
                    onChange={(e) => setGamePlan({
                      ...gamePlan,
                      tactics: { ...gamePlan.tactics, defensive: e.target.value }
                    })}
                    placeholder="Organisation défensive, pressing, repli..."
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    Situations Spéciales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={gamePlan.tactics.specialSituations}
                    onChange={(e) => setGamePlan({
                      ...gamePlan,
                      tactics: { ...gamePlan.tactics, specialSituations: e.target.value }
                    })}
                    placeholder="Jeu de puissance, infériorité numérique, face-offs..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Joueurs Clés & Instructions</h3>
                <Button onClick={addKeyPlayer} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter un Joueur
                </Button>
              </div>

              <div className="space-y-4">
                {gamePlan.keyPlayers.map((player, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Label>Joueur</Label>
                            <Input
                              value={player.player}
                              onChange={(e) => updateKeyPlayer(index, 'player', e.target.value)}
                              placeholder="Nom du joueur (#numéro)"
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Rôle</Label>
                            <Input
                              value={player.role}
                              onChange={(e) => updateKeyPlayer(index, 'role', e.target.value)}
                              placeholder="Position/rôle tactique"
                            />
                          </div>
                          <Button
                            onClick={() => removeKeyPlayer(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 mt-6"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Instructions Spécifiques</Label>
                          <Textarea
                            value={player.instructions}
                            onChange={(e) => updateKeyPlayer(index, 'instructions', e.target.value)}
                            placeholder="Consignes particulières pour ce joueur..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'opponent' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Target className="w-5 h-5" />
                    Forces 
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gamePlan.opponentAnalysis.strengths.map((strength, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 mr-2 mb-2">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    Faiblesses à Exploiter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gamePlan.opponentAnalysis.weaknesses.map((weakness, index) => (
                      <Badge key={index} className="bg-orange-100 text-orange-800 mr-2 mb-2">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Shield className="w-5 h-5" />
                    Menaces Principales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gamePlan.opponentAnalysis.keyThreats.map((threat, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="font-medium text-red-800">{threat}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Sauvegarder le Plan
          </Button>
        </div>
      </div>
    </div>
  );
}