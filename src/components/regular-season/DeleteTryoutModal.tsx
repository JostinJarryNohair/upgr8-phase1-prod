"use client";

import { Tryout } from "@/types/tryout";
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
  Trophy, 
  Users, 
  Calendar, 
  X,
  Trash2
} from "lucide-react";

interface DeleteTryoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tryout: Tryout | null;
  isDeleting?: boolean;
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active": return "Actif";
    case "completed": return "Terminé";
    case "cancelled": return "Annulé";
    default: return status;
  }
};

export function DeleteTryoutModal({
  isOpen,
  onClose,
  onConfirm,
  tryout,
  isDeleting = false,
}: DeleteTryoutModalProps) {
  if (!tryout) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

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
          {/* Tryout Info */}
          <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate">{tryout.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                  {getStatusLabel(tryout.status)}
                </span>
                {tryout.level && <span>• {tryout.level}</span>}
              </div>
              {(tryout.start_date || tryout.end_date) && (
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(tryout.start_date)} {tryout.end_date ? `- ${formatDate(tryout.end_date)}` : ''}
                </p>
              )}
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
                    <Trophy className="w-4 h-4 flex-shrink-0" />
                    <span>Le tryout et ses informations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Toutes les inscriptions des joueurs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>L&apos;historique complet du tryout</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status-specific warning */}
          {tryout.status === "active" && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-orange-900 mb-1">
                    ⚠️ Tryout actif
                  </p>
                  <p className="text-sm text-orange-800">
                    Ce tryout est actuellement actif. Sa suppression annulera automatiquement 
                    toutes les inscriptions en cours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tryout.status === "completed" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    💡 Conseil important
                  </p>
                  <p className="text-sm text-blue-800">
                    Ce tryout est terminé et pourrait avoir généré une saison régulière. 
                    Vérifiez que vous ne supprimez pas des données importantes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Final Warning */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              Êtes-vous absolument sûr de vouloir supprimer{" "}
              <span className="font-bold text-red-600">{tryout.name}</span> ?
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
            <span className="hidden sm:inline">
              {isDeleting ? "Suppression..." : "Supprimer définitivement"}
            </span>
            <span className="sm:hidden">{isDeleting ? "Suppression..." : "Supprimer"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}