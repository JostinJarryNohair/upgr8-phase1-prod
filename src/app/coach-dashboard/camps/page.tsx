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
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Load real camps from database
  useEffect(() => {
    const loadCamps = async () => {
      // CHANGE: Use getSession instead of getUser
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error(t('common.notAuthenticated'));
        setLoading(false);
        return;
      }

      const user = session.user;
      setUserId(user.id); // Store user ID for later use

      const { data, error } = await supabase
        .from("camps")
        .select("*")
        .eq("coach_id", user.id) // ✅ Only this coach's camps
        .order("created_at", { ascending: false }); // ✅ Newest first

      if (error) {
        console.error(t('camps.errorLoadingCamps'), error);
      } else {
        // ✅ Convert all camps from database format
        const formattedCamps = (data || []).map(fromDatabaseFormat);
        setCamps(formattedCamps);
      }

      setLoading(false);
    };

    loadCamps();
  }, [t]);

  const handleAddCamp = async (newCamp: CampFormData) => {
    // CHANGE: Use stored userId instead of calling getUser again
    if (!userId) {
      console.error(t('common.notAuthenticated'));
      return;
    }

    const { data, error } = await supabase
      .from("camps")
      .insert([
        {
          ...toDatabaseFormat(newCamp),
          coach_id: userId, // Use stored userId
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(t('camps.errorAddingCamp'), error);
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
    // CHANGE: Use stored userId
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    const { data, error } = await supabase
      .from("camps")
      .update(updates)
      .eq("id", id)
      .eq("coach_id", userId) // Use stored userId
      .select()
      .single();

    if (error) {
      console.error(t('camps.errorUpdatingCamp'), error);
      return;
    }

    if (data) {
      // ✅ Convert DB format to frontend format
      const formattedCamp = fromDatabaseFormat(data);
      setCamps(camps.map((camp) => (camp.id === id ? formattedCamp : camp)));
    }
  };

  const handleDeleteCamp = async (id: string) => {
    // CHANGE: Use stored userId
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    const { error } = await supabase
      .from("camps")
      .delete()
      .eq("id", id)
      .eq("coach_id", userId); // Use stored userId

    if (error) {
      console.error(t('camps.errorDeletingCamp'), error);
      return;
    }

    setCamps(camps.filter((camp) => camp.id !== id));
  };

  // ✅ Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">{t('camps.loadingCamps')}</div>
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