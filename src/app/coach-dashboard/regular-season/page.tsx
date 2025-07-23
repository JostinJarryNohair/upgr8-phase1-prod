"use client";

import { useState, useEffect } from "react";
import { Tryout, TryoutFormData } from "@/types/tryout";
import { TryoutManagement } from "@/components/regular-season/TryoutManagement";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat, toDatabaseFormat } from "@/lib/mappers/tryoutMapper";
import { useTranslation } from '@/hooks/useTranslation';

export default function RegularSeasonPage() {
  const { t } = useTranslation();
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real tryouts from database
  useEffect(() => {
    const loadTryouts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error(t('common.notAuthenticated'));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("tryouts")
        .select("*")
        .eq("coach_id", user.id) // Only this coach's tryouts
        .order("created_at", { ascending: false }); // Newest first

      if (error) {
        console.error('Error loading tryouts:', error);
      } else {
        // Convert all tryouts from database format
        const formattedTryouts = (data || []).map(fromDatabaseFormat);
        setTryouts(formattedTryouts);
      }

      setLoading(false);
    };

    loadTryouts();
  }, [t]);

  const handleAddTryout = async (newTryout: TryoutFormData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error(t('common.notAuthenticated'));
      return;
    }

    const { data, error } = await supabase
      .from("tryouts")
      .insert([
        {
          ...toDatabaseFormat(newTryout),
          coach_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding tryout:', error);
      return;
    }

    if (data) {
      // Convert raw DB data to frontend format
      const formattedTryout = fromDatabaseFormat(data);
      setTryouts([formattedTryout, ...tryouts]);
    }
  };

  const handleUpdateTryout = async (
    id: string,
    updates: Partial<TryoutFormData>
  ) => {
    const { data, error } = await supabase
      .from("tryouts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tryout:', error);
      return;
    }

    if (data) {
      // Convert DB format to frontend format
      const formattedTryout = fromDatabaseFormat(data);
      setTryouts(tryouts.map((tryout) => (tryout.id === id ? formattedTryout : tryout)));
    }
  };

  const handleDeleteTryout = async (id: string) => {
    const { error } = await supabase.from("tryouts").delete().eq("id", id);

    if (error) {
      console.error('Error deleting tryout:', error);
      return;
    }

    setTryouts(tryouts.filter((tryout) => tryout.id !== id));
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">{t('tryouts.loadingTryouts') || 'Chargement des tryouts...'}</div>
      </div>
    );
  }

  return (
    <TryoutManagement
      tryouts={tryouts}
      onAddTryout={handleAddTryout}
      onUpdateTryout={handleUpdateTryout}
      onDeleteTryout={handleDeleteTryout}
    />
  );
} 