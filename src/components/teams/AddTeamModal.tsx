"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamFormData } from "@/types/team";
import { useTranslation } from '@/hooks/useTranslation';

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (team: TeamFormData) => void;
  isLoading?: boolean;
}

export function AddTeamModal({ isOpen, onClose, onSubmit, isLoading = false }: AddTeamModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    level: "",
  });
  const [errors, setErrors] = useState<Partial<TeamFormData>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Partial<TeamFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    }
    
    if (!formData.level.trim()) {
      newErrors.level = t('validation.required');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ name: "", level: "" });
    setErrors({});
    onClose();
  };

  const levelOptions = [
    { value: "U7", label: "U7" },
    { value: "U9", label: "U9" },
    { value: "U11", label: "U11" },
    { value: "U13", label: "U13" },
    { value: "U15", label: "U15" },
    { value: "U18", label: "U18" },
    { value: "Junior", label: "Junior" },
    { value: "Senior", label: "Senior" },
    { value: "M13", label: "M13" },
    { value: "M15", label: "M15" },
    { value: "M18", label: "M18" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('teams.addTeam')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('teams.teamName')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder={t('teams.teamNamePlaceholder')}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="level">{t('teams.teamLevel')}</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => {
                setFormData({ ...formData, level: value });
                if (errors.level) setErrors({ ...errors, level: undefined });
              }}
            >
              <SelectTrigger className={errors.level ? "border-red-500" : ""}>
                <SelectValue placeholder={t('teams.selectLevel')} />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-sm text-red-500">{errors.level}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.creating') : t('teams.createTeam')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 