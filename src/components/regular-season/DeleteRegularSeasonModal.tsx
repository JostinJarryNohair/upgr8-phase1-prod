"use client";

import { useState } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { RegularSeason } from "@/types/regularSeason";

interface DeleteRegularSeasonModalProps {
  regularSeason: RegularSeason | null;
  isOpen: boolean;
  onClose: () => void;
  onSeasonDeleted: () => void;
}

export default function DeleteRegularSeasonModal({
  regularSeason,
  isOpen,
  onClose,
  onSeasonDeleted,
}: DeleteRegularSeasonModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!regularSeason) return;

    setLoading(true);
    setError("");

    try {
      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Utilisateur non authentifié");
        return;
      }

      // First, check if there are any players in this season
      const { data: playersData, error: playersError } = await supabase
        .from("regular_season_players")
        .select("id")
        .eq("regular_season_id", regularSeason.id);

      if (playersError) {
        console.error("Error checking players:", playersError);
        setError("Erreur lors de la vérification des joueurs");
        return;
      }

      if (playersData && playersData.length > 0) {
        setError(
          `Impossible de supprimer cette saison car elle contient ${playersData.length} joueur(s). Veuillez d'abord supprimer tous les joueurs.`
        );
        return;
      }

      // Delete the regular season
      const { error: deleteError } = await supabase
        .from("regular_seasons")
        .delete()
        .eq("id", regularSeason.id)
        .eq("coach_id", user.id);

      if (deleteError) {
        console.error("Error deleting regular season:", deleteError);
        setError("Erreur lors de la suppression de la saison");
        return;
      }

      onSeasonDeleted();
      onClose();
    } catch (error) {
      console.error("Error deleting regular season:", error);
      setError("Erreur lors de la suppression de la saison");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !regularSeason) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Supprimer la Saison
              </h2>
              <p className="text-sm text-gray-600">
                Cette action est irréversible
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">
                  Êtes-vous sûr de vouloir supprimer cette saison ?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>{regularSeason.name}</strong>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Attention :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Cette action est irréversible</li>
                    <li>Toutes les données de la saison seront perdues</li>
                    <li>Les joueurs associés devront être supprimés d'abord</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-10"
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="h-10 bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              "Suppression..."
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 