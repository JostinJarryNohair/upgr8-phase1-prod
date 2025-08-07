"use client";

import { useState } from "react";
import { Player, PlayerFormData } from "@/types/player";
import { Camp } from "@/types/camp";
import { CampRegistrationWithDetails } from "@/types/campRegistration";
import { PlayerEvaluationWithScores } from "@/types/evaluation";
import { AddPlayerModal } from "./AddPlayerModal";
import { BulkImportModal } from "./BulkImportModal";
import { PlayerInfoModal } from "./PlayerInfoModal";
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  User,
  Upload,
  Bell,
  Settings,
  Eye
} from "lucide-react";

interface PlayersManagementProps {
  players: Player[];
  camps: Camp[];
  campRegistrations: CampRegistrationWithDetails[];
  evaluations: PlayerEvaluationWithScores[];
  onAddPlayer: (player: PlayerFormData) => void;
  onUpdatePlayer: (id: string, updates: Partial<PlayerFormData>) => void;
  onDeletePlayer: (id: string) => void;
  onImportPlayers: (players: Player[]) => void;
  onEvaluationCreated?: () => void;
}

export function PlayersManagement({
  players,
  camps,
  campRegistrations,
  evaluations,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onImportPlayers,
  onEvaluationCreated,
}: PlayersManagementProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Simple search filter - show all players matching search term
  const filteredPlayers = players.filter((player) => {
    if (!searchTerm) return true;
    
    const matchesSearch = `${player.first_name} ${player.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleAddPlayer = (playerData: PlayerFormData) => {
    try {
      onAddPlayer(playerData);
      setIsAddModalOpen(false);
      setError(null);
    } catch {
      setError("Erreur lors de l'ajout du joueur");
    }
  };

  const handleEditPlayer = (playerData: PlayerFormData) => {
    if (!editingPlayer) return;
    
    try {
      onUpdatePlayer(editingPlayer.id, playerData);
      setEditingPlayer(null);
      setError(null);
    } catch {
      setError("Erreur lors de la modification du joueur");
    }
  };

  const handleDeletePlayer = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) {
      try {
        onDeletePlayer(id);
        setError(null);
      } catch {
        setError("Erreur lors de la suppression du joueur");
      }
    }
  };

  const handleViewProfile = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handlePlayerRowClick = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleImportComplete = (importedPlayers: Player[]) => {
    // Call parent component to update players list
    onImportPlayers(importedPlayers);
    setIsImportModalOpen(false);
    setError(null);
  };

  const getPositionLabel = (position: string | undefined) => {
    switch (position) {
      case "forward":
        return "F Centre";
      case "defense":
        return "D Défenseur";
      case "goalie":
        return "G Gardien";
      default:
        return "Non spécifié";
    }
  };

  const getPositionColor = (position: string | undefined) => {
    switch (position) {
      case "forward":
        return "bg-red-500";
      case "defense":
        return "bg-blue-500";
      case "goalie":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gérez et analysez vos joueurs</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Action Buttons and Search */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-3">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un joueur
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer CSV
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un joueur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 w-80"
            />
          </div>
        </div>

        {/* Players Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Tous les joueurs
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <User className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          {searchTerm ? "Aucun joueur trouvé" : "Aucun joueur enregistré"}
                        </p>
                        {!searchTerm && (
                          <Button
                            onClick={() => setIsAddModalOpen(true)}
                            variant="outline"
                            className="mt-2 border-gray-300 text-gray-700"
                          >
                            Ajouter le premier joueur
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => {
                    return (
                      <TableRow 
                        key={player.id} 
                        className="border-gray-200 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all duration-200 group"
                        onClick={() => handlePlayerRowClick(player)}
                      >
                        <TableCell>
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300" 
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {getInitials(player.first_name, player.last_name)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {player.first_name} {player.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                #{player.jersey_number || "N/A"}
                              </div>
                              {/* Show camp registrations */}
                              {campRegistrations.filter(reg => reg.player_id === player.id).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {campRegistrations
                                    .filter(reg => reg.player_id === player.id)
                                    .slice(0, 2)
                                    .map((reg) => {
                                      const camp = camps.find(c => c.id === reg.camp_id);
                                      return camp ? (
                                        <span key={reg.id} className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                          {camp.name}
                                        </span>
                                      ) : null;
                                    })}
                                  {campRegistrations.filter(reg => reg.player_id === player.id).length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{campRegistrations.filter(reg => reg.player_id === player.id).length - 2} autres
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full ${getPositionColor(player.position)} flex items-center justify-center text-white text-xs font-bold`}>
                              {player.position?.charAt(0).toUpperCase() || "N"}
                            </div>
                            <span className="text-gray-900">{getPositionLabel(player.position)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900">{calculateAge(player.birth_date)}</TableCell>
                  
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-gray-200">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPlayer(player);
                                }}
                                className="text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(player);
                                }}
                                className="text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir profil
                              </DropdownMenuItem>
                    
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePlayer(player.id);
                                }}
                                className="text-red-600 hover:bg-gray-100"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer définitivement
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add Player Modal */}
        <AddPlayerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPlayer}
          error={error}
        />

        {/* Edit Player Modal */}
        <AddPlayerModal
          isOpen={!!editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSubmit={handleEditPlayer}
          initialData={editingPlayer}
          error={error}
        />

        {/* Bulk Import Modal */}
        <BulkImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={handleImportComplete}
        />

        {/* Player Info Modal */}
        <PlayerInfoModal
          player={selectedPlayer}
          evaluations={selectedPlayer ? evaluations.filter(e => e.player_id === selectedPlayer.id) : []}
          isOpen={!!selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onEvaluationCreated={onEvaluationCreated}
        />
      </div>
    </div>
  );
}