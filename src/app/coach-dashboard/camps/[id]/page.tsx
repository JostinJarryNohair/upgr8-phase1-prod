"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Archive, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat } from "@/lib/mappers/campMapper";
import { Camp, CampFormData } from "@/types/camp";
import { AddCampModal } from "@/components/camps/AddCampModal";

export default function CampDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campId = params.id as string;

  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch camp data
  useEffect(() => {
    const fetchCamp = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Utilisateur non authentifié");
          return;
        }

        // Fetch camp and verify ownership
        const { data, error: fetchError } = await supabase
          .from("camps")
          .select("*")
          .eq("id", campId)
          .eq("coach_id", user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            setError("Camp non trouvé ou accès non autorisé");
          } else {
            setError("Erreur lors du chargement du camp");
          }
          return;
        }

        if (!data) {
          setError("Camp non trouvé");
          return;
        }

        // Convert to frontend format
        const formattedCamp = fromDatabaseFormat(data);
        setCamp(formattedCamp);
      } catch (err) {
        setError("Erreur inattendue");
        console.error("Error fetching camp:", err);
      } finally {
        setLoading(false);
      }
    };

    if (campId) {
      // Only runs if we have an ID
      fetchCamp();
    }
  }, [campId]); // Triggers when campId changes

  // Handle camp update
  const handleUpdateCamp = async (updatedData: CampFormData) => {
    if (!camp) return;

    try {
      const { data, error } = await supabase
        .from("camps")
        .update({
          name: updatedData.name,
          level: updatedData.level,
          location: updatedData.location,
          description: updatedData.description,
          start_date: updatedData.startDate,
          end_date: updatedData.endDate,
          is_active: updatedData.isActive,
        })
        .eq("id", camp.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating camp:", error);
        return;
      }

      if (data) {
        const updatedCamp = fromDatabaseFormat(data);
        setCamp(updatedCamp);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error("Error updating camp:", err);
    }
  };

  // Handle camp deletion
  const handleDeleteCamp = async () => {
    if (!camp) return;

    try {
      const { error } = await supabase.from("camps").delete().eq("id", camp.id);

      if (error) {
        console.error("Error deleting camp:", error);
        return;
      }

      // Redirect back to camps list
      router.push("/coach-dashboard/camps");
    } catch (err) {
      console.error("Error deleting camp:", err);
    }
  };

  // Handle camp archive/activate
  const handleToggleArchive = async () => {
    if (!camp) return;

    try {
      const { data, error } = await supabase
        .from("camps")
        .update({ is_active: !camp.isActive })
        .eq("id", camp.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating camp status:", error);
        return;
      }

      if (data) {
        const updatedCamp = fromDatabaseFormat(data);
        setCamp(updatedCamp);
      }
    } catch (err) {
      console.error("Error updating camp status:", err);
    }
  };

  // Calculate camp status
  const getCampStatus = (camp: Camp) => {
    if (!camp.isActive) {
      return {
        status: "archived",
        label: "Archivé",
        color: "bg-gray-100 text-gray-800",
      };
    }

    const now = new Date();
    const start = new Date(camp.startDate);
    const end = new Date(camp.endDate);

    if (now < start) {
      return {
        status: "upcoming",
        label: "À venir",
        color: "bg-blue-100 text-blue-800",
      };
    } else if (now > end) {
      return {
        status: "completed",
        label: "Complété",
        color: "bg-green-100 text-green-800",
      };
    } else {
      return {
        status: "active",
        label: "Actif",
        color: "bg-red-100 text-red-800",
      };
    }
  };

  // Calculate duration
  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} jour${days > 1 ? "s" : ""}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Chargement du camp...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => router.push("/coach-dashboard/camps")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux camps
          </Button>
        </div>
      </div>
    );
  }

  // No camp found
  if (!camp) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Camp non trouvé</div>
          <Button onClick={() => router.push("/coach-dashboard/camps")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux camps
          </Button>
        </div>
      </div>
    );
  }

  const campStatus = getCampStatus(camp);

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/coach-dashboard/camps")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux camps
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{camp.name}</h1>
            <p className="text-gray-600">Détails du camp</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleArchive}
            className="flex items-center"
          >
            <Archive className="w-4 h-4 mr-2" />
            {camp.isActive ? "Archiver" : "Activer"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Camp details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and basic info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Informations générales
              </h2>
              <Badge className={campStatus.color}>{campStatus.label}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Niveau
                </label>
                <p className="text-gray-900">{camp.level}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Emplacement
                </label>
                <p className="text-gray-900">{camp.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Date de début
                </label>
                <p className="text-gray-900">
                  {new Date(camp.startDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Date de fin
                </label>
                <p className="text-gray-900">
                  {new Date(camp.endDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Durée
                </label>
                <p className="text-gray-900">
                  {getDuration(camp.startDate, camp.endDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Statut
                </label>
                <p className="text-gray-900">
                  {camp.isActive ? "Actif" : "Archivé"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {camp.description && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {camp.description}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar with stats and actions */}
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistiques
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Jours restants</span>
                <span className="font-medium">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(camp.endDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Progression</span>
                <span className="font-medium">
                  {campStatus.status === "completed"
                    ? "100%"
                    : campStatus.status === "upcoming"
                    ? "0%"
                    : "En cours"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier le camp
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleArchive}
              >
                <Archive className="w-4 h-4 mr-2" />
                {camp.isActive ? "Archiver" : "Activer"}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Dupliquer le camp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AddCampModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateCamp}
        initialData={camp}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Supprimer le camp
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cette action est irréversible
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Êtes-vous sûr de vouloir supprimer le camp{" "}
                  <span className="font-semibold text-gray-900">
                    &ldquo;{camp.name}&rdquo;
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Toutes les données associées à ce camp seront définitivement
                  supprimées.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDeleteCamp}
                  variant="destructive"
                  className="flex-1"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
