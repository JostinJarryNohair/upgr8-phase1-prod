"use client";

import { useState } from "react";
import { Tryout, TryoutFormData } from "@/types/tryout";
import { AddTryoutModal } from "./AddTryoutModal";
import { DeleteTryoutModal } from "./DeleteTryoutModal";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Users,
  Trophy
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
interface TryoutManagementProps {
  tryouts: Tryout[];
  onAddTryout: (tryout: TryoutFormData) => void;
  onUpdateTryout: (id: string, updates: Partial<TryoutFormData>) => void;
  onDeleteTryout: (id: string) => void;
  teamContext?: { name: string; level: string };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-500";
    case "completed": return "bg-blue-500";
    case "cancelled": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active": return "Actif";
    case "completed": return "Terminé";
    case "cancelled": return "Annulé";
    default: return status;
  }
};

export function TryoutManagement({
  tryouts,
  onAddTryout,
  onUpdateTryout,
  onDeleteTryout,
  teamContext,
}: TryoutManagementProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTryout, setEditingTryout] = useState<Tryout | null>(null);
  const [tryoutToDelete, setTryoutToDelete] = useState<Tryout | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (tryout: Tryout) => {
    setEditingTryout(tryout);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (tryout: Tryout) => {
    setTryoutToDelete(tryout);
  };

  const handleConfirmDelete = async () => {
    if (!tryoutToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeleteTryout(tryoutToDelete.id);
      setTryoutToDelete(null);
    } catch (error) {
      console.error("Error deleting tryout:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setTryoutToDelete(null);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTryout(null);
  };

  const handleSave = async (tryoutData: TryoutFormData) => {
    if (editingTryout) {
      await onUpdateTryout(editingTryout.id, tryoutData);
    } else {
      await onAddTryout(tryoutData);
    }
    setIsAddModalOpen(false);
    setEditingTryout(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {teamContext ? `Tryouts - ${teamContext.name}` : "Gestion des Tryouts"}
              </h1>
              {teamContext && (
                <p className="text-gray-600 mt-1">
                  Niveau {teamContext.level}
                </p>
              )}
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau Tryout
            </Button>
          </div>
        </div>

        {/* Tryouts Grid */}
        {tryouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun tryout créé
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier tryout pour commencer la sélection des joueurs.
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Créer mon premier tryout
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tryouts.map((tryout) => (
              <div
                key={tryout.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Tryout Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {tryout.name}
                    </h3>
                    <Badge 
                      className={`${getStatusColor(tryout.status)} text-white`}
                    >
                      {getStatusLabel(tryout.status)}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(tryout)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(tryout)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tryout Details */}
                <div className="space-y-3">
                  {tryout.description && (
                    <p className="text-sm text-gray-600">{tryout.description}</p>
                  )}
                  
                  {tryout.level && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Niveau: {tryout.level}</span>
                    </div>
                  )}

                  {tryout.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{tryout.location}</span>
                    </div>
                  )}

                  {(tryout.start_date || tryout.end_date) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(tryout.start_date)} - {formatDate(tryout.end_date)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tryout Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.href = `/coach-dashboard/tryouts/${tryout.id}`}
                    >
                      Gérer les joueurs
                    </Button>
                    {tryout.status === "active" && (
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => window.location.href = `/coach-dashboard/tryouts/${tryout.id}`}
                      >
                        Terminer le tryout
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Tryout Modal */}
        <AddTryoutModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          onAdd={handleSave}
          editingTryout={editingTryout}
        />

        {/* Delete Tryout Modal */}
        <DeleteTryoutModal
          isOpen={!!tryoutToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          tryout={tryoutToDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
} 