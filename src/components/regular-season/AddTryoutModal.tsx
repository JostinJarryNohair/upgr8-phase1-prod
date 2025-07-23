"use client";

import { useState } from "react";
import { TryoutFormData, TryoutStatus, CampLevel } from "@/types/tryout";
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
import { X, Plus } from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';

interface AddTryoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tryout: TryoutFormData) => void;
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

export function AddTryoutModal({ isOpen, onClose, onAdd }: AddTryoutModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TryoutFormData>({
    name: "",
    description: "",
    status: "active" as TryoutStatus,
    start_date: "",
    end_date: "",
    location: "",
    level: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onAdd(formData);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        status: "active",
        start_date: "",
        end_date: "",
        location: "",
        level: undefined,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error creating tryout:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Créer un nouveau tryout
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Nom du tryout *</Label>
            <Input
              type="text"
              id="name"
              placeholder="Ex: Sélection Équipe U15 2024"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                clearError("name");
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              id="description"
              placeholder="Description des essais..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Level */}
          <div>
            <Label htmlFor="level">Niveau</Label>
            <Select
              value={formData.level}
              onValueChange={(value: CampLevel) =>
                setFormData({ ...formData, level: value })
              }
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

          {/* Location */}
          <div>
            <Label htmlFor="location">Lieu</Label>
            <Input
              type="text"
              id="location"
              placeholder="Ex: Arena Municipal"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                type="date"
                id="start_date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                type="date"
                id="end_date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {loading ? "Création..." : "Créer le tryout"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 