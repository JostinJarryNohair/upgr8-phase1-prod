"use client";

import { useState, useEffect } from "react";
import { Player, PlayerFormData } from "@/types/player";
import { RegularSeasonPlayerWithDetails } from "@/types/regularSeasonPlayer";
import { BulkImportModal } from "@/components/players/BulkImportModal";
import { AddPlayerModal } from "@/components/players/AddPlayerModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Search, 
  Plus,
  Users, 
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromRegularSeasonPlayerDatabaseFormat } from "@/lib/mappers/regularSeasonPlayerMapper";
import { toDatabaseFormat as toPlayerDatabaseFormat } from "@/lib/mappers/playerMapper";
import { toDatabaseFormat as toRegularSeasonPlayerDatabaseFormat } from "@/lib/mappers/regularSeasonPlayerMapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegularSeasonPlayersProps {
  seasonId: string;
}

const getPositionColor = (position?: string) => {
  switch (position) {
    case "forward": return "bg-red-500";
    case "defense": return "bg-blue-500";
    case "goalie": return "bg-green-500";
    default: return "bg-gray-500";
  }
};

const getPositionInitial = (position?: string) => {
  switch (position) {
    case "forward": return "F";
    case "defense": return "D";
    case "goalie": return "G";
    default: return "?";
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800";
    case "inactive": return "bg-gray-100 text-gray-800";
    case "injured": return "bg-orange-100 text-orange-800";
    case "suspended": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status?: string) => {
  switch (status) {
    case "active": return "Actif";
    case "inactive": return "Inactif";
    case "injured": return "Blessé";
    case "suspended": return "Suspendu";
    default: return "Inconnu";
  }
};

export function RegularSeasonPlayers({ seasonId }: RegularSeasonPlayersProps) {
  const [players, setPlayers] = useState<RegularSeasonPlayerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load players for this season
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from("regular_season_players")
          .select(`
            *,
            player:players(*)
          `)
          .eq("regular_season_id", seasonId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading players:", error);
          return;
        }

        const formattedPlayers = (data || []).map(fromRegularSeasonPlayerDatabaseFormat);
        setPlayers(formattedPlayers);
      } catch (error) {
        console.error("Error loading players:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [seasonId]);

  // Filter players based on search and filters
  const filteredPlayers = players.filter(player => {
    const playerData = player.player;
    if (!playerData) return false;

    const matchesSearch = searchTerm === "" || 
      playerData.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playerData.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playerData.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = positionFilter === "all" || playerData.position === positionFilter;
    const matchesStatus = statusFilter === "all" || player.status === statusFilter;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const PlayerStatusBadge = ({ player }: { player: RegularSeasonPlayerWithDetails }) => {
    return (
      <Badge className={getStatusColor(player.status)}>
        {getStatusText(player.status)}
      </Badge>
    );
  };

  const handleStatusChange = async (playerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("regular_season_players")
        .update({ status: newStatus })
        .eq("id", playerId);

      if (error) {
        console.error("Error updating player status:", error);
        return;
      }

      // Update local state
      setPlayers(prev => prev.map(p => 
        p.id === playerId ? { ...p, status: newStatus as "active" | "inactive" | "injured" | "suspended" } : p
      ));
    } catch (error) {
      console.error("Error updating player status:", error);
    }
  };

  const handleAddPlayer = async (playerData: PlayerFormData) => {
    try {
      // First, create the player
      const playerDbData = toPlayerDatabaseFormat(playerData);
      const { data: newPlayer, error: playerError } = await supabase
        .from("players")
        .insert(playerDbData)
        .select()
        .single();

      if (playerError) {
        console.error("Error creating player:", playerError);
        return;
      }

      if (!newPlayer) return;

      // Then, add player to the season
      const seasonPlayerData = toRegularSeasonPlayerDatabaseFormat({
        regular_season_id: seasonId,
        player_id: newPlayer.id,
        status: "active",
      });

      const { data: newSeasonPlayer, error: seasonPlayerError } = await supabase
        .from("regular_season_players")
        .insert(seasonPlayerData)
        .select(`
          *,
          player:players(*)
        `)
        .single();

      if (seasonPlayerError) {
        console.error("Error adding player to season:", seasonPlayerError);
        return;
      }

      if (newSeasonPlayer) {
        const formattedPlayer = fromRegularSeasonPlayerDatabaseFormat(newSeasonPlayer);
        setPlayers(prev => [formattedPlayer, ...prev]);
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  const handleImportPlayers = async (importedPlayers: Player[]) => {
    try {
      const seasonPlayerData = importedPlayers.map(player => ({
        regular_season_id: seasonId,
        player_id: player.id,
        status: "active" as const,
      }));

      const { data: newSeasonPlayers, error } = await supabase
        .from("regular_season_players")
        .insert(seasonPlayerData)
        .select(`
          *,
          player:players(*)
        `);

      if (error) {
        console.error("Error importing players:", error);
        return;
      }

      if (newSeasonPlayers) {
        const formattedPlayers = newSeasonPlayers.map(fromRegularSeasonPlayerDatabaseFormat);
        setPlayers(prev => [...formattedPlayers, ...prev]);
        setIsImportModalOpen(false);
      }
    } catch (error) {
      console.error("Error importing players:", error);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from("regular_season_players")
        .delete()
        .eq("id", playerId);

      if (error) {
        console.error("Error removing player:", error);
        return;
      }

      setPlayers(prev => prev.filter(p => p.id !== playerId));
    } catch (error) {
      console.error("Error removing player:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Chargement des joueurs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Joueurs de la Saison Régulière
          </h2>
          <p className="text-sm text-gray-600">
            Gérez les joueurs de cette saison
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importer
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Joueur
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un joueur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les positions</SelectItem>
            <SelectItem value="forward">Attaquant</SelectItem>
            <SelectItem value="defense">Défenseur</SelectItem>
            <SelectItem value="goalie">Gardien</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
            <SelectItem value="injured">Blessé</SelectItem>
            <SelectItem value="suspended">Suspendu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Players Table */}
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun joueur trouvé
          </h3>
          <p className="text-gray-600">
            {players.length === 0 
              ? "Aucun joueur n'a été ajouté à cette saison."
              : "Aucun joueur ne correspond à vos critères de recherche."
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => {
                const playerData = player.player;
                if (!playerData) return null;

                return (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-medium ${getPositionColor(playerData.position)}`}>
                            {getPositionInitial(playerData.position)}
                          </div>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {playerData.first_name} {playerData.last_name}
                          </div>
                          {playerData.jersey_number && (
                            <div className="text-sm text-gray-500">
                              #{playerData.jersey_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {playerData.position === "forward" ? "Attaquant" :
                         playerData.position === "defense" ? "Défenseur" :
                         playerData.position === "goalie" ? "Gardien" : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <PlayerStatusBadge player={player} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{playerData.email}</div>
                        {playerData.phone && (
                          <div className="text-gray-500">{playerData.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={player.status || "active"}
                          onValueChange={(value) => handleStatusChange(player.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                            <SelectItem value="injured">Blessé</SelectItem>
                            <SelectItem value="suspended">Suspendu</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePlayer(player.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modals */}
      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPlayer}
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportPlayers}
      />
    </div>
  );
} 