"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
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
import { PlayerFormData, PlayerPosition } from "@/types/player";

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlayerFormData) => void;
  initialData?: PlayerFormData | null;
  error?: string | null;
}

const positions: PlayerPosition[] = ["forward", "defense", "goalie"];

export function AddPlayerModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  error,
}: AddPlayerModalProps) {
  const [formData, setFormData] = useState<PlayerFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birth_date: "",
    position: "forward",
    jersey_number: 0,
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    emergency_contact: "",
    medical_notes: "",
    is_active: true,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        email: initialData.email || "",
        phone: initialData.phone || "",
        birth_date: initialData.birth_date || "",
        position: initialData.position || "forward",
        jersey_number: initialData.jersey_number || 0,
        parent_name: initialData.parent_name || "",
        parent_phone: initialData.parent_phone || "",
        parent_email: initialData.parent_email || "",
        emergency_contact: initialData.emergency_contact || "",
        medical_notes: initialData.medical_notes || "",
        is_active: initialData.is_active,
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        birth_date: "",
        position: "forward",
        jersey_number: 0,
        parent_name: "",
        parent_phone: "",
        parent_email: "",
        emergency_contact: "",
        medical_notes: "",
        is_active: true,
      });
    }
    setValidationErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = "Le prénom est requis";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "Le nom est requis";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (
      formData.jersey_number &&
      (formData.jersey_number < 0 || formData.jersey_number > 99)
    ) {
      errors.jersey_number = "Le numéro doit être entre 0 et 99";
    }

    if (formData.parent_email && !/\S+@\S+\.\S+/.test(formData.parent_email)) {
      errors.parent_email = "Format d'email invalide";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? "Modifier le joueur" : "Nouveau joueur"}
          </h2>
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            className="h-12 w-12"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Informations de base
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.first_name}
                  onChange={(e) => {
                    setFormData({ ...formData, first_name: e.target.value });
                    clearFieldError("first_name");
                  }}
                  placeholder="Jean"
                  className={
                    validationErrors.first_name ? "border-red-500" : ""
                  }
                  required
                />
                {validationErrors.first_name && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.first_name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.last_name}
                  onChange={(e) => {
                    setFormData({ ...formData, last_name: e.target.value });
                    clearFieldError("last_name");
                  }}
                  placeholder="Tremblay"
                  className={validationErrors.last_name ? "border-red-500" : ""}
                  required
                />
                {validationErrors.last_name && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Courriel</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    clearFieldError("email");
                  }}
                  placeholder="jean.tremblay@email.com"
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.email}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Utilisé pour détecter les joueurs existants
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="514-555-0123"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date de naissance</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.birth_date}
                onChange={(e) =>
                  setFormData({ ...formData, birth_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* Hockey Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Informations hockey
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      position: value as PlayerPosition,
                    })
                  }
                >
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position === "forward"
                          ? "Attaquant"
                          : position === "defense"
                          ? "Défenseur"
                          : "Gardien"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="number">Numéro de chandail</Label>
                <Input
                  id="number"
                  type="number"
                  min="0"
                  max="99"
                  value={formData.jersey_number || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      jersey_number: parseInt(e.target.value) || 0,
                    });
                    clearFieldError("jersey_number");
                  }}
                  placeholder="99"
                  className={
                    validationErrors.jersey_number ? "border-red-500" : ""
                  }
                />
                {validationErrors.jersey_number && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.jersey_number}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Informations parent/tuteur
            </h3>

            <div>
              <Label htmlFor="parentName">Nom du parent/tuteur</Label>
              <Input
                id="parentName"
                value={formData.parent_name}
                onChange={(e) =>
                  setFormData({ ...formData, parent_name: e.target.value })
                }
                placeholder="Nom du parent ou tuteur"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentPhone">Téléphone du parent</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parent_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_phone: e.target.value })
                  }
                  placeholder="514-555-0124"
                />
              </div>

              <div>
                <Label htmlFor="parentEmail">Courriel du parent</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => {
                    setFormData({ ...formData, parent_email: e.target.value });
                    clearFieldError("parent_email");
                  }}
                  placeholder="parent@email.com"
                  className={
                    validationErrors.parent_email ? "border-red-500" : ""
                  }
                />
                {validationErrors.parent_email && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.parent_email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency & Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Urgence et médical
            </h3>

            <div>
              <Label htmlFor="emergencyContact">Contact d&apos;urgence</Label>
              <Input
                id="emergencyContact"
                type="text"
                value={formData.emergency_contact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergency_contact: e.target.value,
                  })
                }
                placeholder="Nom et numéro de téléphone"
              />
            </div>

            <div>
              <Label htmlFor="medicalNotes">Notes médicales</Label>
              <Input
                id="medicalNotes"
                type="text"
                value={formData.medical_notes}
                onChange={(e) =>
                  setFormData({ ...formData, medical_notes: e.target.value })
                }
                placeholder="Allergies, conditions médicales, etc."
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.is_active ? "true" : "false"}
              onValueChange={(value) =>
                setFormData({ ...formData, is_active: value === "true" })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Actif</SelectItem>
                <SelectItem value="false">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              {initialData ? "Enregistrer" : "Ajouter le joueur"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
