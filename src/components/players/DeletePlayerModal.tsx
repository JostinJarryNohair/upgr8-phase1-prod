"use client";

import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  User, 
  FileText, 
  Clock, 
  X,
  Trash2
} from "lucide-react";

interface DeletePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  player: Player | null;
  isDeleting?: boolean;
}

export function DeletePlayerModal({
  isOpen,
  onClose,
  onConfirm,
  player,
  isDeleting = false,
}: DeletePlayerModalProps) {
  if (!player) return null;

  const playerName = `${player.first_name} ${player.last_name}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Suppression définitive</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Player Info */}
          <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate">{playerName}</h3>
              <p className="text-sm text-gray-600 truncate">
                {player.position && `${player.position} • `}
                {player.jersey_number && `#${player.jersey_number}`}
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 min-w-0">
                <p className="text-sm font-medium text-red-900">
                  Cette action supprimera définitivement :
                </p>
                <ul className="text-sm text-red-800 space-y-1">
                  <li className="flex items-center space-x-2">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>Le profil complet du joueur</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>Toutes ses évaluations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Son historique complet</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Advice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  💡 Conseil important
                </p>
                <p className="text-sm text-blue-800">
                  Exportez ou sauvegardez les évaluations importantes avant de continuer. 
                  Cette action ne peut pas être annulée.
                </p>
              </div>
            </div>
          </div>

          {/* Final Warning */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              Êtes-vous absolument sûr de vouloir supprimer{" "}
              <span className="font-bold text-red-600">{playerName}</span> ?
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 order-2 sm:order-1"
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 order-1 sm:order-2"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Supprimer définitivement</span>
            <span className="sm:hidden">{isDeleting ? "Suppression..." : "Supprimer"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}