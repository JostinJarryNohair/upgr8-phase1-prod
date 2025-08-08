"use client";

import { useState, useEffect } from "react";
import { Player, PlayerFormData } from "@/types/player";
import { TryoutRegistrationWithDetails } from "@/types/tryoutRegistration";
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
  UserCheck, 
  UserX, 
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromTryoutRegistrationDatabaseFormat } from "@/lib/mappers/tryoutRegistrationMapper";
import { toDatabaseFormat as toPlayerDatabaseFormat } from "@/lib/mappers/playerMapper";

interface TryoutPlayersProps {
  tryoutId: string;
  onStatsChange?: () => void;
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

export function TryoutPlayers({ tryoutId, onStatsChange }: TryoutPlayersProps) {
  const [registrations, setRegistrations] = useState<TryoutRegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load registrations for this tryout
  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const { data, error } = await supabase
          .from("tryout_registrations")
          .select(`
            *,
            player:players(*)
          `)
          .eq("tryout_id", tryoutId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading registrations:", error);
          return;
        }

        const formattedRegistrations = (data || []).map(fromTryoutRegistrationDatabaseFormat);
        setRegistrations(formattedRegistrations);
      } catch (error) {
        console.error("Error loading registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
  }, [tryoutId]);

  // Filter registrations based on search and filters
  const filteredRegistrations = registrations.filter(registration => {
    const player = registration.player;
    if (!player) return false;

    const matchesSearch = !searchTerm || 
      `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = positionFilter === "all" || player.position === positionFilter;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "cut" && registration.status === "cancelled") ||
      (statusFilter === "uncut" && registration.status === "confirmed");

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const getPlayerInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const PlayerStatusBadge = ({ registration }: { registration: TryoutRegistrationWithDetails }) => {
    const isCut = registration.status === "cancelled";
    return (
      <Badge variant={isCut ? "destructive" : "default"} className="flex items-center gap-1">
        {isCut ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
        {isCut ? "Retranché" : "Sélectionné"}
      </Badge>
    );
  };

  const handleToggleCut = async (playerId: string) => {
    try {
      // Find the current registration
      const registration = registrations.find(reg => reg.player_id === playerId);
      if (!registration) {
        console.error("Registration not found for player:", playerId);
        return;
      }

      const newStatus = registration.status === "cancelled" ? "confirmed" : "cancelled";
      console.log(`🔄 Changing player ${playerId} from "${registration.status}" to "${newStatus}"`);

      // Update in database with returned data
      const { data: updatedData, error } = await supabase
        .from("tryout_registrations")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq("tryout_id", tryoutId)
        .eq("player_id", playerId)
        .select(`
          *,
          player:players(*)
        `)
        .single();

      if (error) {
        console.error("Error updating registration status:", error);
        return;
      }

      if (updatedData) {
        // Update local state with the returned data from database
        const updatedRegistration = fromTryoutRegistrationDatabaseFormat(updatedData);
        
        setRegistrations(prev => {
          const newRegistrations = prev.map(reg =>
            reg.player_id === playerId ? updatedRegistration : reg
          );
          console.log("✅ Local state updated successfully");
          
          // Notify parent component to refresh stats
          if (onStatsChange) {
            onStatsChange();
          }
          
          return newRegistrations;
        });
      }
    } catch (error) {
      console.error("Error toggling cut status:", error);
    }
  };

  const handleAddPlayer = async (playerData: PlayerFormData) => {
    try {
      // Create the player first
      const { data: playerDbData, error: playerError } = await supabase
        .from("players")
        .insert([toPlayerDatabaseFormat(playerData)])
        .select()
        .single();

      if (playerError) {
        console.error("Error creating player:", playerError);
        return;
      }

      // Then register them for this tryout
      const { data: registrationData, error: registrationError } = await supabase
        .from("tryout_registrations")
        .insert([{
          tryout_id: tryoutId,
          player_id: playerDbData.id,
          status: "confirmed"
        }])
        .select(`
          *,
          player:players(*)
        `)
        .single();

      if (registrationError) {
        console.error("Error creating registration:", registrationError);
        return;
      }

      // Add to local state
      const formattedRegistration = fromTryoutRegistrationDatabaseFormat(registrationData);
      setRegistrations(prev => [formattedRegistration, ...prev]);
      
      // Notify parent component to refresh stats
      if (onStatsChange) {
        onStatsChange();
      }

    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  const handleImportPlayers = async (importedPlayers: Player[]) => {
    try {
      const results = {
        registered: 0,
        alreadyRegistered: 0,
        errors: [] as { player: string; error: string }[]
      };

      // Process each player individually to handle duplicates gracefully
      for (const player of importedPlayers) {
        try {
          // Check if player is already registered to this tryout
          const { data: existingRegistration } = await supabase
            .from("tryout_registrations")
            .select("id")
            .eq("tryout_id", tryoutId)
            .eq("player_id", player.id)
            .single();

          if (existingRegistration) {
            // Player already registered, skip
            results.alreadyRegistered++;
            continue;
          }

          // Register player to tryout
          const { data: registrationData, error: registrationError } = await supabase
            .from("tryout_registrations")
            .insert({
              tryout_id: tryoutId,
              player_id: player.id,
              status: 'confirmed' as const
            })
            .select(`
              *,
              player:players(*)
            `)
            .single();

          if (registrationError) {
            results.errors.push({
              player: `${player.first_name} ${player.last_name}`,
              error: registrationError.message
            });
            continue;
          }

          if (registrationData) {
            // Add to local state
            const newRegistration = fromTryoutRegistrationDatabaseFormat(registrationData);
            setRegistrations(prev => [newRegistration, ...prev]);
            results.registered++;
          }
        } catch (playerError) {
          results.errors.push({
            player: `${player.first_name} ${player.last_name}`,
            error: playerError instanceof Error ? playerError.message : 'Unknown error'
          });
        }
      }

      // Show summary message
      if (results.registered > 0 || results.alreadyRegistered > 0) {
        let message = "";
        if (results.registered > 0) {
          message += `${results.registered} joueur(s) ajouté(s) au tryout`;
        }
        if (results.alreadyRegistered > 0) {
          if (message) message += ", ";
          message += `${results.alreadyRegistered} joueur(s) déjà inscrit(s)`;
        }
        
        // Show success message
        console.log("✅ Import réussi:", message);
        
        // Show errors separately if any
        if (results.errors.length > 0) {
          console.warn(`⚠️ ${results.errors.length} erreur(s) lors de l'import:`, results.errors);
        }
      } else if (results.errors.length > 0) {
        console.error("❌ Import échoué:", results.errors);
      }
      
      // Notify parent component to refresh stats
      if (onStatsChange) {
        onStatsChange();
      }
    } catch (error) {
      console.error("Error importing players:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <div className="text-gray-600">Chargement des joueurs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Joueurs du Tryout</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez les joueurs et leurs statuts de sélection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau joueur
            </Button>
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importer joueurs
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      {registrations.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher un joueur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Toutes positions</option>
              <option value="forward">Attaquants</option>
              <option value="defense">Défenseurs</option>
              <option value="goalie">Gardiens</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tous statuts</option>
              <option value="uncut">Sélectionnés</option>
              <option value="cut">Retranchés</option>
            </select>
          </div>
        </div>
      )}

      {/* Players Table */}
      <div className="p-6">
        {registrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun joueur dans ce tryout
            </h3>
            <p className="text-gray-600 mb-4">
              Ajoutez des joueurs pour commencer les sélections.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouveau joueur
              </Button>
              <Button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Importer joueurs
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Numéro</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => {
                const player = registration.player;
                if (!player) return null;
                return (
                <TableRow key={registration.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <div className={`w-full h-full ${getPositionColor(player.position)} flex items-center justify-center text-white font-bold text-xs`}>
                          {getPlayerInitials(player.first_name, player.last_name)}
                        </div>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {player.first_name} {player.last_name}
                        </div>
                        {player.email && (
                          <div className="text-sm text-gray-500">{player.email}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getPositionInitial(player.position)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {player.jersey_number ? `#${player.jersey_number}` : "-"}
                  </TableCell>
                  <TableCell>
                    <PlayerStatusBadge registration={registration} />
                  </TableCell>
                  <TableCell>
                    {registration.status === "cancelled" ? (
                      <Button
                        onClick={() => handleToggleCut(player.id)}
                        size="sm"
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white h-6 px-2 py-1 text-xs"
                      >
                        <UserCheck className="h-3 w-3" />
                        Sélectionner
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleToggleCut(player.id)}
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-1 h-6 px-2 py-1 text-xs"
                      >
                        <UserX className="h-3 w-3" />
                        Retrancher
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modals */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportPlayers}
      />

      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPlayer}
      />
    </div>
  );
} 