"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, AlertCircle, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface CampPlayersProps {
  campId: string;
}

export function CampPlayers({ campId }: CampPlayersProps) {
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
        setError("Non authentifié");
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
        setError("Erreur lors du chargement des joueurs");
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

      // Debug: Log player data to see birth_date values
      console.log(
        "Player data with birth dates:",
        transformedPlayers.map((p) => ({
          name: `${p.first_name} ${p.last_name}`,
          birth_date: p.birth_date,
          age: calculateAge(p.birth_date || null),
        }))
      );

      setPlayers(transformedPlayers);
    } catch (error) {
      console.error("Error loading camp players:", error);
      setError("Erreur lors du chargement des joueurs");
    } finally {
      setLoading(false);
    }
  }, [campId]);

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
        throw new Error("Non authentifié");
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
            throw new Error("Ce joueur est déjà inscrit à ce camp");
          }
        } else {
          // Create new player
          const { data: newPlayer, error: playerError } = await supabase
            .from("players")
            .insert([playerData])
            .select("id")
            .single();

          if (playerError) {
            throw new Error("Erreur lors de la création du joueur");
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
          throw new Error("Erreur lors de la création du joueur");
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
        throw new Error("Erreur lors de l'inscription au camp");
      }

      // Close modal and reload players
      setIsAddPlayerModalOpen(false);
      await loadCampPlayers();
    } catch (error) {
      console.error("Error adding player:", error);
      setAddPlayerError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'ajout du joueur"
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
        throw new Error("Erreur lors de la modification du statut");
      }

      // Reload players to reflect the change
      await loadCampPlayers();
    } catch (error) {
      console.error("Error toggling cut status:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la modification"
      );
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Actif</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-orange-700">
              En attente
            </span>
          </div>
        );
      case "cancelled":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-700">Retranché</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              Non défini
            </span>
          </div>
        );
    }
  };

  // Generate team colors for visual variety - using muted, professional colors
  const getTeamColor = (playerId: string) => {
    const colors = [
      "bg-red-800",
      "bg-yellow-700",
      "bg-green-800",
      "bg-gray-800",
      "bg-purple-800",
      "bg-blue-800",
      "bg-indigo-800",
      "bg-teal-800",
    ];
    const index = playerId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get position abbreviation
  const getPositionAbbr = (position: string | null) => {
    switch (position) {
      case "goalie":
        return "G";
      case "forward":
        return "C";
      case "defense":
        return "D";
      default:
        return "?";
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;

    console.log("Birth date:", birthDate);
    try {
      const today = new Date();
      const birth = new Date(birthDate);

      // Check if the date is valid
      if (isNaN(birth.getTime())) {
        console.warn("Invalid birth date:", birthDate);
        return null;
      }

      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        return age - 1;
      }
      return age;
    } catch (error) {
      console.error("Error calculating age:", error);
      return null;
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
          Chargement des joueurs...
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
            Réessayer
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
                placeholder="Rechercher un joueur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Rechercher un joueur"
              />
            </div>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les groupes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les groupes</SelectItem>
                {/* TODO: Add dynamic groups */}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {filteredPlayers.length} joueur
              {filteredPlayers.length !== 1 ? "s" : ""} trouvé
              {filteredPlayers.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Plus de filtres
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setIsAddPlayerModalOpen(true)}
                disabled={addingPlayer}
                aria-label="Ajouter un nouveau joueur"
              >
                {addingPlayer ? "Ajout en cours..." : "+ Ajouter un joueur"}
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
                Aucun joueur inscrit
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter des joueurs à ce camp.
              </p>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setIsAddPlayerModalOpen(true)}
                disabled={addingPlayer}
                aria-label="Ajouter un nouveau joueur"
              >
                {addingPlayer ? "Ajout en cours..." : "+ Ajouter un joueur"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlayers.map((player) => {
                const fullName = `${player.first_name || ""} ${
                  player.last_name || ""
                }`.trim();
                const age = calculateAge(player.birth_date || null);
                const teamColor = getTeamColor(player.id);
                const positionAbbr = getPositionAbbr(player.position || null);

                return (
                  <div
                    key={player.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Header with team color */}
                    <div className={`${teamColor} p-3 text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              #{player.jersey_number || "?"}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">
                              {fullName || "Nom non défini"}
                            </h4>
                            <p className="text-xs text-white/80">
                              {player.position
                                ? `${
                                    player.position.charAt(0).toUpperCase() +
                                    player.position.slice(1)
                                  }`
                                : "Position non définie"}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white/20 px-2 py-1 rounded-full">
                          <span className="text-xs font-bold text-white">
                            {positionAbbr}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics section */}
                    <div className="p-3 bg-gray-50">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-white rounded p-2 text-center">
                          <div className="text-xs text-gray-500">Âge</div>
                          <div className="font-semibold text-sm">
                            {age ? `${age} ans` : "Non défini"}
                          </div>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <div className="text-xs text-gray-500">PJ</div>
                          <div className="font-semibold text-sm">
                            {player.jersey_number || "0"}
                          </div>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <div className="text-xs text-gray-500">+/-</div>
                          <div className="font-semibold text-sm">
                            {player.jersey_number
                              ? (player.jersey_number > 10 ? "+" : "-") +
                                Math.abs(player.jersey_number % 15)
                              : "0"}
                          </div>
                        </div>
                      </div>

                      {/* Status and additional info */}
                      <div className="space-y-2">
                        {getStatusBadge(player.registration_status || null)}

                        {player.email && (
                          <div className="text-xs text-gray-600 truncate">
                            {player.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          disabled={loading || addingPlayer}
                        >
                          Détails
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs"
                          onClick={() => handleToggleCut(player.id)}
                          disabled={
                            loading ||
                            addingPlayer ||
                            player.registration_status === "cancelled"
                          }
                          aria-label={`Retrancher ${fullName}`}
                        >
                          {player.registration_status === "cancelled"
                            ? "Retranché"
                            : "Retrancher"}
                        </Button>
                      </div>
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
