"use client";

import { useState, useEffect } from "react";
import { Player, PlayerFormData } from "@/types/player";
import { Camp } from "@/types/camp";
import { CampRegistrationWithDetails } from "@/types/campRegistration";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromPlayerDatabaseFormat, toDatabaseFormat as toPlayerDatabaseFormat } from "@/lib/mappers/playerMapper";
import { fromDatabaseFormat as fromCampDatabaseFormat } from "@/lib/mappers/campMapper";
import { fromDatabaseFormat as fromCampRegistrationDatabaseFormat } from "@/lib/mappers/campRegistrationMapper";
import { useTranslation } from '@/hooks/useTranslation';
import { PlayersManagement } from "@/components/players/PlayersManagement";
export default function PlayersPage() {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [campRegistrations, setCampRegistrations] = useState<CampRegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Load players and camps from database
  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error(t('common.notAuthenticated'));
        setLoading(false);
        return;
      }

      // Load camps for the current coach
      const { data: campsData, error: campsError } = await supabase
        .from("camps")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (campsError) {
        console.error("Error loading camps:", campsError);
      } else {
        const formattedCamps = (campsData || []).map(fromCampDatabaseFormat);
        setCamps(formattedCamps);
      }

      // Load camp registrations with player and camp details
      const { data: registrationsData, error: registrationsError } = await supabase
        .from("camp_registrations")
        .select(`
          *,
          player:players(id, first_name, last_name, email, position, jersey_number),
          camp:camps(id, name, level, start_date, end_date)
        `)
        .order("created_at", { ascending: false });

      if (registrationsError) {
        console.error("Error loading camp registrations:", registrationsError);
      } else {
        const formattedRegistrations = (registrationsData || []).map(fromCampRegistrationDatabaseFormat);
        setCampRegistrations(formattedRegistrations);
      }

      // Load all players (we'll filter by camp registrations in the component)
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false });

      if (playersError) {
        console.error("Error loading players:", playersError);
      } else {
        const formattedPlayers = (playersData || []).map(fromPlayerDatabaseFormat);
        setPlayers(formattedPlayers);
      }

      setLoading(false);
    };

    loadData();
  }, [t]);

  const handleAddPlayer = async (newPlayer: PlayerFormData) => {
    const { data, error } = await supabase
      .from("players")
      .insert([toPlayerDatabaseFormat(newPlayer)])
      .select()
      .single();

    if (error) {
      console.error("Error adding player:", error);
      return;
    }

    if (data) {
      const formattedPlayer = fromPlayerDatabaseFormat(data);
      setPlayers([formattedPlayer, ...players]);
    }
  };

  const handleUpdatePlayer = async (
    id: string,
    updates: Partial<PlayerFormData>
  ) => {
    const { data, error } = await supabase
      .from("players")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating player:", error);
      return;
    }

    if (data) {
      const formattedPlayer = fromPlayerDatabaseFormat(data);
      setPlayers(players.map((player) => (player.id === id ? formattedPlayer : player)));
    }
  };

  const handleDeletePlayer = async (id: string) => {
    const { error } = await supabase.from("players").delete().eq("id", id);

    if (error) {
      console.error("Error deleting player:", error);
      return;
    }

    setPlayers(players.filter((player) => player.id !== id));
  };

  const handleImportPlayers = (importedPlayers: Player[]) => {
    // Add imported players to the current list (avoid duplicates)
    const existingIds = new Set(players.map(p => p.id));
    const newPlayers = importedPlayers.filter(p => !existingIds.has(p.id));
    setPlayers([...newPlayers, ...players]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Chargement des joueurs...</div>
      </div>
    );
  }

  return (
    <PlayersManagement
      players={players}
      camps={camps}
      campRegistrations={campRegistrations}
      onAddPlayer={handleAddPlayer}
      onUpdatePlayer={handleUpdatePlayer}
      onDeletePlayer={handleDeletePlayer}
      onImportPlayers={handleImportPlayers}
    />
  );
} 