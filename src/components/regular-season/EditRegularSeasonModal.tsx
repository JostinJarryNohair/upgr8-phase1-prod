"use client";

import { useState, useEffect } from "react";
import { X, Calendar, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { RegularSeason, RegularSeasonFormData, RegularSeasonStatus } from "@/types/regularSeason";
import { toDatabaseFormat } from "@/lib/mappers/regularSeasonMapper";

interface EditRegularSeasonModalProps {
  regularSeason: RegularSeason | null;
  isOpen: boolean;
  onClose: () => void;
  onSeasonUpdated: (updatedSeason: RegularSeason) => void;
}

export default function EditRegularSeasonModal({
  regularSeason,
  isOpen,
  onClose,
  onSeasonUpdated,
}: EditRegularSeasonModalProps) {
  const [formData, setFormData] = useState<RegularSeasonFormData>({
    name: "",
    description: "",
    status: "active" as RegularSeasonStatus,
    start_date: "",
    end_date: "",
    location: "",
    level: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form data when regularSeason changes
  useEffect(() => {
    if (regularSeason) {
      setFormData({
        name: regularSeason.name,
        description: regularSeason.description || "",
        status: regularSeason.status,
        start_date: regularSeason.start_date || "",
        end_date: regularSeason.end_date || "",
        location: regularSeason.location || "",
        level: regularSeason.level,
      });
      setError("");
    }
  }, [regularSeason]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Le nom de la saison est requis");
      return false;
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        setError("La date de fin doit être après la date de début");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !regularSeason) return;

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

      const databaseData = {
        ...toDatabaseFormat(formData),
        coach_id: user.id,
      };

      const { data: updatedSeason, error } = await supabase
        .from("regular_seasons")
        .update(databaseData)
        .eq("id", regularSeason.id)
        .eq("coach_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating regular season:", error);
        setError("Erreur lors de la mise à jour de la saison");
        return;
      }

      if (updatedSeason) {
        // Convert back to UI format
        const formattedSeason: RegularSeason = {
          id: updatedSeason.id,
          coach_id: updatedSeason.coach_id,
          name: updatedSeason.name,
          description: updatedSeason.description,
          status: updatedSeason.status,
          start_date: updatedSeason.start_date,
          end_date: updatedSeason.end_date,
          location: updatedSeason.location,
          level: updatedSeason.level,
          created_at: updatedSeason.created_at,
          updated_at: updatedSeason.updated_at,
        };

        onSeasonUpdated(formattedSeason);
        onClose();
      }
    } catch (error) {
      console.error("Error updating regular season:", error);
      setError("Erreur lors de la mise à jour de la saison");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof RegularSeasonFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError("");
  };

  if (!isOpen || !regularSeason) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Modifier la Saison Régulière
              </h2>
              <p className="text-sm text-gray-600">
                Mettez à jour les informations de la saison
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nom de la saison *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Saison 2024-2025"
              className="h-10"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description de la saison régulière..."
              rows={3}
            />
          </div>

          {/* Status and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Statut
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="text-sm font-medium text-gray-700">
                Niveau
              </Label>
              <Select
                value={formData.level || ""}
                onValueChange={(value) => handleInputChange("level", value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="U7">U7</SelectItem>
                  <SelectItem value="U9">U9</SelectItem>
                  <SelectItem value="U11">U11</SelectItem>
                  <SelectItem value="U13">U13</SelectItem>
                  <SelectItem value="U15">U15</SelectItem>
                  <SelectItem value="U18">U18</SelectItem>
                  <SelectItem value="M13">M13</SelectItem>
                  <SelectItem value="M15">M15</SelectItem>
                  <SelectItem value="M18">M18</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 inline mr-1" />
              Lieu
            </Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Ex: Aréna de Montréal"
              className="h-10"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date de début
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date de fin
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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
              type="submit"
              disabled={loading}
              className="h-10 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 