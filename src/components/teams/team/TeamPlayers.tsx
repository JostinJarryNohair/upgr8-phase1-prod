"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, AlertCircle, CheckCircle, UserPlus, Users, Trash2 } from "lucide-react";
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
import { Player } from "@/types/player";
import { TeamPlayerWithPlayerInfo } from "@/types/teamPlayer";
import { supabase } from "@/lib/supabase/client";
import { AddPlayerToTeamModal } from "./AddPlayerToTeamModal";
import { fromTeamPlayerDatabaseFormat, toTeamPlayerDatabaseFormat } from "@/lib/mappers/teamPlayerMapper";
import { useTranslation } from '@/hooks/useTranslation';

interface TeamPlayersProps {
  teamId: string;
}

export function TeamPlayers({ teamId }: TeamPlayersProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayerWithPlayerInfo[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailablePlayers, setLoadingAvailablePlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Player Modal state
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null);

  // Load team players
  const loadTeamPlayers = useCallback(async () => {
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

      const { data, error } = await supabase
        .from("team_players")
        .select(`
          *,
          player:players (
            id,
            first_name,
            last_name,
            email,
            phone,
            position,
            jersey_number,
            is_active
          )
        `)
        .eq("team_id", teamId);

      if (error) {
        console.error("Error loading team players:", error);
        setError(t('players.errorLoadingPlayers'));
        return;
      }

      const formattedTeamPlayers = (data || []).map(fromTeamPlayerDatabaseFormat);
      setTeamPlayers(formattedTeamPlayers);
    } catch (error) {
      console.error("Error loading team players:", error);
      setError(t('players.errorLoadingPlayers'));
    } finally {
      setLoading(false);
    }
  }, [teamId, t]);

  // Load available players (not already in this team)
  const loadAvailablePlayers = useCallback(async () => {
    try {
      setLoadingAvailablePlayers(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // First get all players in this team
      const { data: teamPlayerIds, error: teamPlayerError } = await supabase
        .from("team_players")
        .select("player_id")
        .eq("team_id", teamId);

      if (teamPlayerError) {
        console.error("Error loading team player IDs:", teamPlayerError);
        return;
      }

      // Get all active players
      const { data, error } = await supabase
        .from("players")
        .select("id, first_name, last_name, email, phone, position, jersey_number, is_active, created_at, updated_at")
        .eq("is_active", true);

      if (error) {
        console.error("Error loading available players:", error);
        return;
      }

      // Filter out players already in the team
      const teamPlayerIdSet = new Set(teamPlayerIds?.map(tp => tp.player_id) || []);
      const availablePlayers = data?.filter(player => !teamPlayerIdSet.has(player.id)) || [];

      console.log("Available players loaded:", availablePlayers.length);
      setAvailablePlayers(availablePlayers);
    } catch (error) {
      console.error("Error loading available players:", error);
    } finally {
      setLoadingAvailablePlayers(false);
    }
  }, [teamId]);

  // Load data
  useEffect(() => {
    loadTeamPlayers();
    loadAvailablePlayers();
  }, [loadTeamPlayers, loadAvailablePlayers]);

  const handleAddPlayerToTeam = async (playerId: string) => {
    try {
      setAddingPlayer(true);
      setAddPlayerError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAddPlayerError(t('players.notAuthenticated'));
        return;
      }

      // Add player to team
      const teamPlayerData = toTeamPlayerDatabaseFormat({
        player_id: playerId,
        team_id: teamId,
      });

      const { error } = await supabase
        .from("team_players")
        .insert([teamPlayerData]);

      if (error) {
        console.error("Error adding player to team:", error);
        setAddPlayerError(t('players.errorAddingPlayer'));
        return;
      }

      // Reload data
      await loadTeamPlayers();
      await loadAvailablePlayers();
      setIsAddPlayerModalOpen(false);
    } catch (error) {
      console.error("Error adding player to team:", error);
      setAddPlayerError(t('players.errorAddingPlayer'));
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleRemovePlayerFromTeam = async (teamPlayerId: string) => {
    try {
      const { error } = await supabase
        .from("team_players")
        .delete()
        .eq("id", teamPlayerId);

      if (error) {
        console.error("Error removing player from team:", error);
        return;
      }

      // Reload data
      await loadTeamPlayers();
      await loadAvailablePlayers();
    } catch (error) {
      console.error("Error removing player from team:", error);
    }
  };

  // Add loading state for remove operation
  const [removingPlayerId, setRemovingPlayerId] = useState<string | null>(null);
  const [playerToRemove, setPlayerToRemove] = useState<TeamPlayerWithPlayerInfo | null>(null);

  const handleRemovePlayerWithLoading = async (teamPlayerId: string) => {
    setRemovingPlayerId(teamPlayerId);
    try {
      await handleRemovePlayerFromTeam(teamPlayerId);
    } finally {
      setRemovingPlayerId(null);
      setPlayerToRemove(null);
    }
  };

  const handleRemoveClick = (teamPlayer: TeamPlayerWithPlayerInfo) => {
    setPlayerToRemove(teamPlayer);
  };

  const getStatusBadge = (isActive: boolean | null) => {
    if (isActive) {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t('players.active')}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t('players.inactive')}
        </Badge>
      );
    }
  };

  const getPositionBadge = (position: string | null | undefined) => {
    const positionColors: Record<string, string> = {
      "forward": "bg-red-100 text-red-800",
      "defense": "bg-blue-100 text-blue-800",
      "goalie": "bg-green-100 text-green-800",
    };
    
    const positionLabels: Record<string, string> = {
      "forward": t('players.forward'),
      "defense": t('players.defense'),
      "goalie": t('players.goalie'),
    };

    const pos = position || "";
    return (
      <Badge className={positionColors[pos] || "bg-gray-100 text-gray-800"}>
        {positionLabels[pos] || t('players.undefinedPosition')}
      </Badge>
    );
  };

  // Memoized filtering for performance
  const filteredTeamPlayers = useMemo(() => {
    return teamPlayers.filter((teamPlayer) => {
      const player = teamPlayer.player;
      const fullName = `${player.first_name || ""} ${player.last_name || ""}`
        .trim()
        .toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        player.jersey_number?.toString().includes(searchQuery) ||
        player.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPosition =
        selectedPosition === "all" || player.position === selectedPosition;
      const matchesStatus =
        statusFilter === "all" || 
        (statusFilter === "active" && player.is_active) ||
        (statusFilter === "inactive" && !player.is_active);

      return matchesSearch && matchesPosition && matchesStatus;
    });
  }, [teamPlayers, searchQuery, selectedPosition, statusFilter]);

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
          <Button onClick={loadTeamPlayers} variant="outline" size="sm">
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
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('players.allPositions')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('players.allPositions')}</SelectItem>
                <SelectItem value="forward">{t('players.forward')}</SelectItem>
                <SelectItem value="defense">{t('players.defense')}</SelectItem>
                <SelectItem value="goalie">{t('players.goalie')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('players.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('players.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('players.active')}</SelectItem>
                <SelectItem value="inactive">{t('players.inactive')}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsAddPlayerModalOpen(true)}
              className="flex items-center gap-2"
              disabled={availablePlayers.length === 0 || loadingAvailablePlayers}
              title={availablePlayers.length === 0 ? t('players.allPlayersAlreadyInTeam') : undefined}
            >
              <UserPlus className="w-4 h-4" />
              {loadingAvailablePlayers ? t('common.loading') : t('players.addPlayer')}
            </Button>
          </div>
        </div>

        {/* Players List */}
        <div className="p-6">
          {filteredTeamPlayers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {teamPlayers.length === 0 ? t('players.noPlayers') : t('players.noResults')}
              </h3>
              <p className="text-gray-600 mb-4">
                {teamPlayers.length === 0 
                  ? t('players.addFirstPlayer') 
                  : t('players.tryDifferentSearch')
                }
              </p>
              {teamPlayers.length === 0 && availablePlayers.length > 0 && (
                <Button onClick={() => setIsAddPlayerModalOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('players.addPlayer')}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeamPlayers.map((teamPlayer) => {
                const player = teamPlayer.player;
                const fullName = `${player.first_name || ""} ${
                  player.last_name || ""
                }`.trim();
                return (
                  <div
                    key={teamPlayer.id}
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
                      {getStatusBadge(player.is_active)}
                      {getPositionBadge(player.position)}
                      {player.email && (
                        <div className="text-sm text-gray-600">
                          {player.email}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t">
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
                        onClick={() => handleRemoveClick(teamPlayer)}
                        disabled={loading || addingPlayer || removingPlayerId === teamPlayer.id}
                        aria-label={`${t('players.remove')} ${fullName}`}
                      >
                        <Trash2 className="w-4 h-4" />
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
      <AddPlayerToTeamModal
        isOpen={isAddPlayerModalOpen}
        onClose={() => {
          setIsAddPlayerModalOpen(false);
          setAddPlayerError(null);
        }}
        onSubmit={handleAddPlayerToTeam}
        error={addPlayerError}
        availablePlayers={availablePlayers}
      />

      {/* Remove Player Confirmation Modal */}
      {playerToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('players.remove')}</h3>
            <p className="text-gray-600 mb-6">
              {t('players.remove')} {playerToRemove.player.first_name} {playerToRemove.player.last_name} {t('players.fromTeam')}?
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setPlayerToRemove(null)}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleRemovePlayerWithLoading(playerToRemove.id)}
                disabled={removingPlayerId === playerToRemove.id}
              >
                {removingPlayerId === playerToRemove.id ? t('common.deleting') : t('players.remove')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 