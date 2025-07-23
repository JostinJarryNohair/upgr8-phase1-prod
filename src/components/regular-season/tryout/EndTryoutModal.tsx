"use client";

import { useState } from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Trophy, 
  Users, 
  Calendar,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { TryoutFormData, CampLevel } from "@/types/tryout";
import { useTranslation } from '@/hooks/useTranslation';

interface EndTryoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndTryout: (regularSeasonData: TryoutFormData) => void;
  selectedPlayers: Player[];
  tryoutName: string;
}

const CAMP_LEVELS: { value: CampLevel; label: string }[] = [
  { value: "U7", label: "U7" },
  { value: "U9", label: "U9" },
  { value: "U11", label: "U11" },
  { value: "U13", label: "U13" },
  { value: "U15", label: "U15" },
  { value: "U18", label: "U18" },
  { value: "M13", label: "M13" },
  { value: "M15", label: "M15" },
  { value: "M18", label: "M18" },
  { value: "Junior", label: "Junior" },
  { value: "Senior", label: "Senior" },
];

const getPositionColor = (position?: string) => {
  switch (position) {
    case "forward": return "bg-red-500";
    case "defense": return "bg-blue-500";
    case "goalie": return "bg-green-500";
    default: return "bg-gray-500";
  }
};

const getPositionInitial = (position?: string) => {
  switch (position) {
    case "forward": return "F";
    case "defense": return "D";
    case "goalie": return "G";
    default: return "?";
  }
};

export function EndTryoutModal({ 
  isOpen, 
  onClose, 
  onEndTryout, 
  selectedPlayers,
  tryoutName 
}: EndTryoutModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'confirm' | 'create-season'>('confirm');
  
  // Generate next year's season name automatically
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const defaultSeasonName = `Saison Régulière ${nextYear}`;
  
  const [seasonData, setSeasonData] = useState<TryoutFormData>({
    name: defaultSeasonName,
    description: `Saison régulière formée à partir des sélections de: ${tryoutName}`,
    status: "active",
    start_date: `${nextYear}-01-01`,
    end_date: `${nextYear}-12-31`,
    location: "",
    level: undefined,
  });

  const getPlayerInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleConfirmEnd = () => {
    setStep('create-season');
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    try {
      await onEndTryout(seasonData);
      onClose();
      // Reset state
      setStep('confirm');
      setSeasonData({
        name: defaultSeasonName,
        description: `Saison régulière formée à partir des sélections de: ${tryoutName}`,
        status: "active",
        start_date: `${nextYear}-01-01`,
        end_date: `${nextYear}-12-31`,
        location: "",
        level: undefined,
      });
    } catch (error) {
      console.error("Error ending tryout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('confirm');
  };

  const handleCloseModal = () => {
    setStep('confirm');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'confirm' ? 'Terminer le Tryout' : 'Créer la Saison Régulière'}
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' ? (
            // Step 1: Confirmation and Selected Players
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Terminer "{tryoutName}"
                </h3>
                <p className="text-gray-600">
                  Vous êtes sur le point de terminer ce tryout et créer une équipe de saison régulière 
                  avec les {selectedPlayers.length} joueurs sélectionnés.
                </p>
              </div>

              {/* Selected Players Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">
                    Joueurs Sélectionnés ({selectedPlayers.length})
                  </h4>
                </div>

                {selectedPlayers.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    Aucun joueur sélectionné. Vous pouvez quand même terminer le tryout.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                    {selectedPlayers.map((player) => (
                      <div key={player.id} className="flex items-center space-x-3 bg-white rounded p-2">
                        <Avatar className="h-8 w-8">
                          <div className={`w-full h-full ${getPositionColor(player.position)} flex items-center justify-center text-white font-bold text-xs`}>
                            {getPlayerInitials(player.first_name, player.last_name)}
                          </div>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {player.first_name} {player.last_name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getPositionInitial(player.position)}
                            </Badge>
                            {player.jersey_number && (
                              <span className="text-xs text-gray-500">#{player.jersey_number}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmEnd}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  Continuer
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Create Regular Season
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Créer la Saison Régulière {nextYear}
                </h3>
                <p className="text-gray-600">
                  Configurez les détails de votre nouvelle saison régulière.
                </p>
              </div>

              {/* Season Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="season-name">Nom de la saison *</Label>
                  <Input
                    type="text"
                    id="season-name"
                    value={seasonData.name}
                    onChange={(e) => setSeasonData({ ...seasonData, name: e.target.value })}
                    placeholder="Ex: Saison Régulière 2025"
                  />
                </div>

                <div>
                  <Label htmlFor="season-description">Description</Label>
                  <Input
                    type="text"
                    id="season-description"
                    value={seasonData.description}
                    onChange={(e) => setSeasonData({ ...seasonData, description: e.target.value })}
                    placeholder="Description de la saison..."
                  />
                </div>

                <div>
                  <Label htmlFor="season-level">Niveau</Label>
                  <Select
                    value={seasonData.level}
                    onValueChange={(value: CampLevel) => setSeasonData({ ...seasonData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMP_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="season-location">Lieu</Label>
                  <Input
                    type="text"
                    id="season-location"
                    value={seasonData.location}
                    onChange={(e) => setSeasonData({ ...seasonData, location: e.target.value })}
                    placeholder="Ex: Arena Municipal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="season-start">Date de début</Label>
                    <Input
                      type="date"
                      id="season-start"
                      value={seasonData.start_date}
                      onChange={(e) => setSeasonData({ ...seasonData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="season-end">Date de fin</Label>
                    <Input
                      type="date"
                      id="season-end"
                      value={seasonData.end_date}
                      onChange={(e) => setSeasonData({ ...seasonData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Selected Players Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {selectedPlayers.length} joueurs seront automatiquement ajoutés à cette saison
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Retour
                </Button>
                <div className="space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleCreateSeason}
                    disabled={loading || !seasonData.name.trim()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Trophy className="h-4 w-4" />
                    {loading ? "Création..." : "Créer la Saison"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 