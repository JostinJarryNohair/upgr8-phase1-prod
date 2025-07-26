"use client";

import { useState, useEffect } from "react";
import { Team, TeamFormData } from "@/types/team";
import { TeamsManagement } from "@/components/teams/TeamsManagement";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat, toDatabaseFormat } from "@/lib/mappers/teamMapper";
import { useTranslation } from '@/hooks/useTranslation';

export default function TeamsPage() {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Load teams from database
  useEffect(() => {
    const loadTeams = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error(t('common.notAuthenticated'));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading teams:", error);
      } else {
        // Convert all teams from database format
        const formattedTeams = (data || []).map(fromDatabaseFormat);
        setTeams(formattedTeams);
      }

      setLoading(false);
    };

    loadTeams();
  }, [t]);

  const handleAddTeam = async (teamData: TeamFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error(t('common.notAuthenticated'));
        return;
      }

      const dbTeam = toDatabaseFormat(teamData, user.id);

      const { data, error } = await supabase
        .from("teams")
        .insert(dbTeam)
        .select()
        .single();

      if (error) {
        console.error("Error creating team:", error);
        return;
      }

      // Add the new team to the list
      const newTeam = fromDatabaseFormat(data);
      setTeams([newTeam, ...teams]);
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  // const handleUpdateTeam = async (id: string, updates: Partial<TeamFormData>) => {
  //   try {
  //     const dbUpdates = toDatabaseUpdateFormat(updates);

  //     const { data, error } = await supabase
  //       .from("teams")
  //       .update(dbUpdates)
  //       .eq("id", id)
  //       .select()
  //       .single();

  //     if (error) {
  //       console.error("Error updating team:", error);
  //       return;
  //     }

  //     // Update the team in the list
  //     const updatedTeam = fromDatabaseFormat(data);
  //     setTeams(teams.map(team => team.id === id ? updatedTeam : team));
  //   } catch (error) {
  //     console.error("Error updating team:", error);
  //   }
  // };

  const handleDeleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting team:", error);
        return;
      }

      // Remove the team from the list
      setTeams(teams.filter(team => team.id !== id));
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">{t('teams.loading')}</div>
      </div>
    );
  }

  return (
    <TeamsManagement
      teams={teams}
      onAddTeam={handleAddTeam}
      onDeleteTeam={handleDeleteTeam}
    />
  );
} 