"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, AlertCircle, CheckCircle, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayerWithRegistration, PlayerFormData } from "@/types/player";
import { supabase } from "@/lib/supabase/client";
import { AddPlayerModal } from "@/components/players/AddPlayerModal";
import { useTranslation } from '@/hooks/useTranslation';

interface CampPlayersProps {
  campId: string;
}

export function CampPlayers({ campId }: CampPlayersProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [players, setPlayers] = useState<PlayerWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Player Modal state
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null);

  // Extracted and memoized data loading function
  const loadCampPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError(t('players.notAuthenticated'));
        return;
      }

      // Query camp registrations with player data
      const { data, error } = await supabase
        .from("camp_registrations")
        .select(
          `
          *,
          players (
            id,
            first_name,
            last_name,
            email,
            phone,
            birth_date,
            position,
            jersey_number,
            parent_name,
            parent_phone,
            parent_email,
            emergency_contact,
            medical_notes,
            is_active,
            created_at,
            updated_at
          )
        `
        )
        .eq("camp_id", campId);

      if (error) {
        console.error("Error loading camp players:", error);
        setError(t('players.errorLoadingPlayers'));
        return;
      }

      // Transform data to PlayerWithRegistration format
      const transformedPlayers: PlayerWithRegistration[] =
        data?.map((registration) => ({
          ...registration.players,
          registration_id: registration.id,
          registration_status: registration.status,
          payment_status: registration.payment_status,
          registration_date: registration.registration_date,
          notes: registration.notes,
        })) || [];

      setPlayers(transformedPlayers);
    } catch (error) {
      console.error("Error loading camp players:", error);
      setError(t('players.errorLoadingPlayers'));
    } finally {
      setLoading(false);
    }
  }, [campId, t]);

  // Load players for this camp
  useEffect(() => {
    loadCampPlayers();
  }, [loadCampPlayers]);

  // Handle adding a new player - simple and safe approach
  const handleAddPlayer = async (playerData: PlayerFormData) => {
    try {
      setAddingPlayer(true);
      setAddPlayerError(null);

      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error(t('players.notAuthenticated'));
      }

      let playerId: string;

      // Check if player already exists (by email if provided)
      if (playerData.email) {
        const { data: existingPlayer } = await supabase
          .from("players")
          .select("id")
          .eq("email", playerData.email)
          .single();

        if (existingPlayer) {
          playerId = existingPlayer.id;

          // Check if already registered to this camp
          const { data: existingRegistration } = await supabase
            .from("camp_registrations")
            .select("id")
            .eq("player_id", playerId)
            .eq("camp_id", campId)
            .neq("status", "cancelled")
            .single();

          if (existingRegistration) {
            throw new Error(t('players.playerAlreadyRegistered'));
          }
        } else {
          // Create new player
          const { data: newPlayer, error: playerError } = await supabase
            .from("players")
            .insert([playerData])
            .select("id")
            .single();

          if (playerError) {
            throw new Error(t('players.errorCreatingPlayer'));
          }
          playerId = newPlayer.id;
        }
      } else {
        // No email, create new player
        const { data: newPlayer, error: playerError } = await supabase
          .from("players")
          .insert([playerData])
          .select("id")
          .single();

        if (playerError) {
          throw new Error(t('players.errorCreatingPlayer'));
        }
        playerId = newPlayer.id;
      }

      // Register player to camp
      const { error: registrationError } = await supabase
        .from("camp_registrations")
        .insert([
          {
            camp_id: campId,
            player_id: playerId,
            status: "confirmed",
            payment_status: "paid",
          },
        ]);

      if (registrationError) {
        throw new Error(t('players.errorRegisteringCamp'));
      }

      // Close modal and reload players
      setIsAddPlayerModalOpen(false);
      await loadCampPlayers();
    } catch (error) {
      console.error("Error adding player:", error);
      setAddPlayerError(
        error instanceof Error
          ? error.message
          : t('players.errorCreatingPlayer')
      );
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleToggleCut = async (playerId: string) => {
    try {
      // Update the registration status to cancelled
      const { error } = await supabase
        .from("camp_registrations")
        .update({ status: "cancelled" })
        .eq("player_id", playerId)
        .eq("camp_id", campId);

      if (error) {
        console.error("Error updating registration status:", error);
        throw new Error(t('players.errorUpdatingStatus'));
      }

      // Reload players to reflect the change
      await loadCampPlayers();
    } catch (error) {
      console.error("Error toggling cut status:", error);
      setError(
        error instanceof Error
          ? error.message
          : t('players.errorModifying')
      );
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('players.confirmed')}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('players.pending')}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('players.cancelled')}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('players.undefinedStatus')}
          </Badge>
        );
    }
  };

  // Memoized filtering for performance
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const fullName = `${player.first_name || ""} ${player.last_name || ""}`
        .trim()
        .toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        player.jersey_number?.toString().includes(searchQuery) ||
        player.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGroup = selectedGroup === "all"; // TODO: Implement group filtering
      const matchesStatus =
        statusFilter === "all" || player.registration_status === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [players, searchQuery, selectedGroup, statusFilter]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-600">
          {t('players.loadingPlayers')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600 mb-4">{error}</div>
        <div className="text-center">
          <Button onClick={loadCampPlayers} variant="outline" size="sm">
            {t('players.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('players.searchPlayer')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label={t('players.searchPlayer')}
              />
            </div>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('players.allGroups')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('players.allGroups')}</SelectItem>
                {/* TODO: Add dynamic groups */}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('players.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('players.allStatuses')}</SelectItem>
                <SelectItem value="confirmed">{t('players.confirmed')}</SelectItem>
                <SelectItem value="pending">{t('players.pending')}</SelectItem>
                <SelectItem value="cancelled">{t('players.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {filteredPlayers.length} {filteredPlayers.length === 1 ? t('players.playerFound') : t('players.playersFound')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                {t('players.moreFilters')}
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setIsAddPlayerModalOpen(true)}
                disabled={addingPlayer}
                aria-label={t('players.addPlayer')}
              >
                {addingPlayer ? t('players.addingPlayer') : `+ ${t('players.addPlayer')}`}
              </Button>
            </div>
          </div>

          {/* Error message for adding player */}
          {addPlayerError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{addPlayerError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="p-6">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('players.noPlayersRegistered')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('players.startByAddingPlayers')}
              </p>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setIsAddPlayerModalOpen(true)}
                disabled={addingPlayer}
                aria-label={t('players.addPlayer')}
              >
                {addingPlayer ? t('players.addingPlayer') : `+ ${t('players.addPlayer')}`}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.map((player) => {
                const fullName = `${player.first_name || ""} ${
                  player.last_name || ""
                }`.trim();
                return (
                  <div
                    key={player.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            #{player.jersey_number || "?"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {fullName || t('players.undefinedName')}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {player.position || t('players.undefinedPosition')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {getStatusBadge(player.registration_status || null)}
                      {player.email && (
                        <div className="text-sm text-gray-600">
                          {player.email}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={loading || addingPlayer}
                      >
                        {t('players.viewDetails')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleToggleCut(player.id)}
                        disabled={
                          loading ||
                          addingPlayer ||
                          player.registration_status === "cancelled"
                        }
                        aria-label={`${t('players.cut')} ${fullName}`}
                      >
                        {player.registration_status === "cancelled"
                          ? t('players.cutPlayer')
                          : t('players.cut')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Player Modal */}
      <AddPlayerModal
        isOpen={isAddPlayerModalOpen}
        onClose={() => {
          setIsAddPlayerModalOpen(false);
          setAddPlayerError(null);
        }}
        onSubmit={handleAddPlayer}
        error={addPlayerError}
      />
    </>
  );
}
