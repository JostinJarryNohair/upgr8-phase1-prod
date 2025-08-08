"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle,
  X,
  Trash2,
  Trophy,
  Users,
  Calendar,
  Target
} from "lucide-react";
import { Team } from "@/types/team";

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  team: Team;
  isDeleting?: boolean;
  relatedDataCount?: {
    tryouts: number;
    seasons: number;
    players: number;
  };
}

export function DeleteTeamModal({
  isOpen,
  onClose,
  onConfirm,
  team,
  isDeleting = false,
  relatedDataCount
}: DeleteTeamModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const expectedText = team.name;
  const isConfirmationValid = confirmationText === expectedText;

  const handleConfirm = () => {
    if (isConfirmationValid && !isDeleting) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Supprimer l'équipe
              </h2>
              <p className="text-sm text-gray-600">
                Cette action est irréversible
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={isDeleting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Team Info */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Trophy className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{team.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{team.level}</Badge>
                    <span className="text-sm text-gray-500">
                      Créée le {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning about related data */}
          {relatedDataCount && (
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      Données associées qui seront supprimées
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {relatedDataCount.tryouts > 0 && (
                        <li className="flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>{relatedDataCount.tryouts} tryout{relatedDataCount.tryouts > 1 ? 's' : ''}</span>
                        </li>
                      )}
                      {relatedDataCount.seasons > 0 && (
                        <li className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{relatedDataCount.seasons} saison{relatedDataCount.seasons > 1 ? 's' : ''} régulière{relatedDataCount.seasons > 1 ? 's' : ''}</span>
                        </li>
                      )}
                      {relatedDataCount.players > 0 && (
                        <li className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{relatedDataCount.players} enregistrement{relatedDataCount.players > 1 ? 's' : ''} de joueur{relatedDataCount.players > 1 ? 's' : ''}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Attention : Suppression définitive
                  </h4>
                  <p className="text-sm text-red-700">
                    Cette action supprimera définitivement l'équipe <strong>"{team.name}"</strong> et 
                    toutes ses données associées (tryouts, saisons, enregistrements de joueurs). 
                    Cette action ne peut pas être annulée.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tapez le nom de l'équipe pour confirmer la suppression :
            </label>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Tapez : <code className="bg-gray-100 px-2 py-1 rounded text-red-600 font-medium">{expectedText}</code>
              </div>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Nom de l'équipe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isDeleting}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isConfirmationValid || isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}