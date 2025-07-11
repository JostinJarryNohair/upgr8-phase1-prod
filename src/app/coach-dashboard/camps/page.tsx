"use client";

import { useState } from "react";
import { Camp } from "@/types/camp";
import { CampManagement } from "@/components/camps/CampManagement";

const mockCamps: Camp[] = [
  {
    id: "camp-1",
    name: "Camp M15 Excellence",
    level: "M15",
    location: "Centre Sportif Montréal",
    startDate: "2025-03-10",
    endDate: "2025-03-15",
    description: "Camp de développement pour les joueurs M15",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "camp-2",
    name: "Camp M13 Développement",
    level: "M13",
    location: "Aréna Laval",
    startDate: "2025-03-17",
    endDate: "2025-03-20",
    description: "Camp de développement pour les joueurs M13",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "camp-3",
    name: "Camp U18 Élite",
    level: "U18",
    location: "Complexe Sportif Québec",
    startDate: "2025-02-01",
    endDate: "2025-02-05",
    description: "Camp de développement pour les joueurs U18",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
  },
];

export default function CampsPage() {
  const [camps, setCamps] = useState<Camp[]>(mockCamps);

  const handleAddCamp = (
    newCamp: Omit<Camp, "id" | "createdAt" | "updatedAt">
  ) => {
    const camp: Camp = {
      ...newCamp,
      id: `camp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCamps([...camps, camp]);
  };

  const handleUpdateCamp = (id: string, updates: Partial<Camp>) => {
    setCamps(
      camps.map((camp) => (camp.id === id ? { ...camp, ...updates } : camp))
    );
  };

  const handleDeleteCamp = (id: string) => {
    setCamps(camps.filter((camp) => camp.id !== id));
  };

  return (
    <CampManagement
      camps={camps}
      onAddCamp={handleAddCamp}
      onUpdateCamp={handleUpdateCamp}
      onDeleteCamp={handleDeleteCamp}
    />
  );
}
