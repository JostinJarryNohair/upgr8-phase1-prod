"use client";

import { useState, useEffect } from "react";
import { Camp, CampFormData } from "@/types/camp";
import { CampManagement } from "@/components/camps/CampManagement";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat, toDatabaseFormat } from "@/lib/mappers/campMapper";
import { useTranslation } from '@/hooks/useTranslation';

export default function CampsPage() {
  const { t } = useTranslation();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load real camps from database
  useEffect(() => {
    const loadCamps = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("No authenticated user");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("camps")
        .select("*")
        .eq("coach_id", user.id) // ✅ Only this coach's camps
        .order("created_at", { ascending: false }); // ✅ Newest first

      if (error) {
        console.error("Error loading camps:", error);
      } else {
        // ✅ Convert all camps from database format
        const formattedCamps = (data || []).map(fromDatabaseFormat);
        setCamps(formattedCamps);
      }

      setLoading(false);
    };

    loadCamps();
  }, []);

  const handleAddCamp = async (newCamp: CampFormData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user");
      return;
    }

    const { data, error } = await supabase
      .from("camps")
      .insert([
        {
          ...toDatabaseFormat(newCamp),
          coach_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding camp:", error);
      return;
    }

    if (data) {
      // ✅ CONVERT raw DB data to frontend format!
      const formattedCamp = fromDatabaseFormat(data);
      setCamps([formattedCamp, ...camps]); // ✅ Now properly formatted
    }
  };

  const handleUpdateCamp = async (
    id: string,
    updates: Partial<CampFormData>
  ) => {
    const { data, error } = await supabase
      .from("camps")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating camp:", error);
      return;
    }

    if (data) {
      // ✅ Convert DB format to frontend format
      const formattedCamp = fromDatabaseFormat(data);
      setCamps(camps.map((camp) => (camp.id === id ? formattedCamp : camp)));
    }
  };

  const handleDeleteCamp = async (id: string) => {
    const { error } = await supabase.from("camps").delete().eq("id", id);

    if (error) {
      console.error("Error deleting camp:", error);
      return;
    }

    setCamps(camps.filter((camp) => camp.id !== id));
  };

  // ✅ Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Chargement des camps...</div>
      </div>
    );
  }

  return (
    <CampManagement
      camps={camps}
      onAddCamp={handleAddCamp}
      onUpdateCamp={handleUpdateCamp}
      onDeleteCamp={handleDeleteCamp}
    />
  );
}
