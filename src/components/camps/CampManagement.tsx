"use client";

import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Camp, CampFormData } from "@/types/camp";
import { AddCampModal } from "@/components/camps/AddCampModal";
import { useTranslation } from '@/hooks/useTranslation';

interface CampManagementProps {
  camps: Camp[]; // Display uses full records
  onAddCamp: (camp: CampFormData) => void; // Form submits user input only
  onUpdateCamp: (id: string, updates: Partial<CampFormData>) => void;
  onDeleteCamp: (id: string) => void;
}

export function CampManagement({
  camps,
  onAddCamp,
  onDeleteCamp,
}: CampManagementProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "archived"
  >("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [campToDelete, setCampToDelete] = useState<Camp | null>(null);

  const handleCampClick = (camp: Camp) => {
    router.push(`/coach-dashboard/camps/${camp.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, camp: Camp) => {
    e.stopPropagation(); // Prevent triggering camp click
    setCampToDelete(camp);
  };

  const handleConfirmDelete = () => {
    if (campToDelete) {
      onDeleteCamp(campToDelete.id);
      setCampToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setCampToDelete(null);
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

  // ✅ FIXED - Now expects Camp (what it actually receives)
  const getStatusBadge = (camp: Camp) => {
    if (!camp.isActive) {
      return <Badge className="bg-gray-100 text-gray-800">{t('camps.inactive')}</Badge>;
    }

    const now = new Date();
    const start = new Date(camp.startDate);
    const end = new Date(camp.endDate);

    if (now < start) {
      return <Badge className="bg-blue-100 text-blue-800">{t('camps.upcoming')}</Badge>;
    } else if (now > end) {
      return <Badge className="bg-green-100 text-green-800">{t('camps.completed')}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">{t('camps.active')}</Badge>;
    }
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ${t('camps.days')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('camps.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('camps.subtitle')}</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('camps.newCamp')}
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{camps.length}</div>
          <div className="text-sm text-gray-600">{t('camps.totalCamps')}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-green-600">
            {activeCamps.length}
          </div>
          <div className="text-sm text-gray-600">{t('camps.activeCamps')}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-600">
            {archivedCamps.length}
          </div>
          <div className="text-sm text-gray-600">{t('camps.archivedCamps')}</div>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t('camps.searchCamps')}
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
              {t('common.all')}
            </Button>
            <Button
              variant={selectedStatus === "active" ? "default" : "outline"}
              onClick={() => setSelectedStatus("active")}
              size="sm"
            >
              {t('camps.active')}
            </Button>
            <Button
              variant={selectedStatus === "archived" ? "default" : "outline"}
              onClick={() => setSelectedStatus("archived")}
              size="sm"
            >
              {t('camps.inactive')}
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
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer relative group"
          >
            {/* Delete Button - positioned absolutely */}
            <Button
              onClick={(e) => handleDeleteClick(e, camp)}
              variant="destructive"
              size="sm"
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

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
                  <span className="text-gray-600">{t('camps.location')} :</span>
                  <span className="text-gray-900 font-medium">
                    {camp.location}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('camps.duration')} :</span>
                  <span className="text-gray-900 font-medium">
                    {getDuration(camp.startDate, camp.endDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('camps.dates')} :</span>
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
                  {t('camps.clickToManage')}
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
            {t('camps.noCampsFound')}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedStatus !== "all"
              ? t('camps.adjustSearchCriteria')
              : t('camps.createFirstCamp')}
          </p>
          {!searchQuery && selectedStatus === "all" && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('camps.createFirstCamp')}
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {campToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelDelete}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('camps.deleteCamp')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('camps.deleteWarning')}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  {t('camps.deleteConfirmation')}{" "}
                  <span className="font-semibold text-gray-900">
                    &ldquo;{campToDelete.name}&rdquo;
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {t('camps.deleteDescription')}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCancelDelete}
                  variant="outline"
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  variant="destructive"
                  className="flex-1"
                >
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddCampModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(campData) => {
          onAddCamp(campData);
          setIsAddModalOpen(false); // Close modal after successful submission
        }}
      />
    </div>
  );
}
