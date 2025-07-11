"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Camp } from "@/types/camp";
import { AddCampModal } from "@/components/camps/AddCampModal";

interface CampManagementProps {
  camps: Camp[];
  onAddCamp: (camp: Omit<Camp, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateCamp: (id: string, updates: Partial<Camp>) => void;
  onDeleteCamp: (id: string) => void;
}

export function CampManagement({ camps, onAddCamp }: CampManagementProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "archived"
  >("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const handleCampClick = (camp: Camp) => {
    router.push(`/dashboard/coach/camp/${camp.id}`);
  };

  const filteredCamps = camps.filter((camp) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && camp.isActive) ||
      (selectedStatus === "archived" && !camp.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeCamps = camps.filter((camp) => camp.isActive);
  const archivedCamps = camps.filter((camp) => !camp.isActive);

  const getStatusBadge = (camp: Camp) => {
    if (!camp.isActive) {
      return <Badge className="bg-gray-100 text-gray-800">Archivé</Badge>;
    }

    const now = new Date();
    const start = new Date(camp.startDate);
    const end = new Date(camp.endDate);

    if (now < start) {
      return <Badge className="bg-blue-100 text-blue-800">À venir</Badge>;
    } else if (now > end) {
      return <Badge className="bg-green-100 text-green-800">Complété</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Actif</Badge>;
    }
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} jour${days > 1 ? "s" : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des camps
          </h1>
          <p className="text-gray-600 mt-2">Organisez vos camps de hockey</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau camp
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{camps.length}</div>
          <div className="text-sm text-gray-600">Total des camps</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-green-600">
            {activeCamps.length}
          </div>
          <div className="text-sm text-gray-600">Camps actifs</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-600">
            {archivedCamps.length}
          </div>
          <div className="text-sm text-gray-600">Camps archivés</div>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Rechercher des camps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
              size="sm"
            >
              Tous les camps
            </Button>
            <Button
              variant={selectedStatus === "active" ? "default" : "outline"}
              onClick={() => setSelectedStatus("active")}
              size="sm"
            >
              Actifs
            </Button>
            <Button
              variant={selectedStatus === "archived" ? "default" : "outline"}
              onClick={() => setSelectedStatus("archived")}
              size="sm"
            >
              Archivés
            </Button>
          </div>
        </div>
      </div>
      {/* Camps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCamps.map((camp) => (
          <div
            key={camp.id}
            onClick={() => handleCampClick(camp)}
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {camp.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(camp)}
                    <Badge variant="outline">{camp.level}</Badge>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Emplacement :</span>
                  <span className="text-gray-900 font-medium">
                    {camp.location}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Durée :</span>
                  <span className="text-gray-900 font-medium">
                    {getDuration(camp.startDate, camp.endDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Dates :</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(camp.startDate).toLocaleDateString("fr-FR")} -{" "}
                    {new Date(camp.endDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer with hover effect */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100">
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Cliquez pour gérer le camp
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {filteredCamps.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun camp trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedStatus !== "all"
              ? "Ajustez vos critères de recherche"
              : "Créez votre premier camp pour commencer"}
          </p>
          {!searchQuery && selectedStatus === "all" && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer votre premier camp
            </Button>
          )}
        </div>
      )}
      <AddCampModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddCamp}
      />
    </div>
  );
}
