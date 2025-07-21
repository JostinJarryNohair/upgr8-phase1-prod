"use client";

import { useState } from "react";
import { Player, PlayerFormData } from "@/types/player";
import { Camp } from "@/types/camp";
import { CampRegistrationWithDetails } from "@/types/campRegistration";
import { AddPlayerModal } from "./AddPlayerModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Download,
  Upload,
  Filter,
  List,
  Bell,
  Settings,
  Star,
  Users,
  Eye
} from "lucide-react";

interface PlayersManagementProps {
  players: Player[];
  camps: Camp[];
  campRegistrations: CampRegistrationWithDetails[];
  onAddPlayer: (player: PlayerFormData) => void;
  onUpdatePlayer: (id: string, updates: Partial<PlayerFormData>) => void;
  onDeletePlayer: (id: string) => void;
}

const categories = [
  { id: "all", name: "Tous les joueurs", count: 0, active: true },
  { id: "my", name: "Mes joueurs", count: 0, active: false },
  { id: "prospects", name: "Prospects", count: 0, active: false },
  { id: "favorites", name: "Favoris", count: 0, active: false },
];

const positions = [
  { id: "forward", name: "Attaquants", initial: "F", color: "bg-red-500", count: 0 },
  { id: "defense", name: "Défenseurs", initial: "D", color: "bg-blue-500", count: 0 },
  { id: "goalie", name: "Gardiens", initial: "G", color: "bg-green-500", count: 0 },
];

export function PlayersManagement({
  players,
  camps,
  campRegistrations,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
}: PlayersManagementProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  // Calculate counts for categories and positions
  const calculateCounts = () => {
    const positionCounts = positions.map(pos => ({
      ...pos,
      count: players.filter(p => p.position === pos.id).length
    }));

    const categoryCounts = categories.map(cat => ({
      ...cat,
      count: players.length // For now, all players count
    }));

    return { positionCounts, categoryCounts };
  };

  const { positionCounts, categoryCounts } = calculateCounts();

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = `${player.first_name} ${player.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = !selectedPosition || player.position === selectedPosition;
    
    // Filter by camp if a camp is selected
    const matchesCamp = !selectedCamp || campRegistrations.some(reg => 
      reg.player_id === player.id && reg.camp_id === selectedCamp
    );
    
    return matchesSearch && matchesPosition && matchesCamp;
  });

  const handleAddPlayer = (playerData: PlayerFormData) => {
    try {
      onAddPlayer(playerData);
      setIsAddModalOpen(false);
      setError(null);
    } catch (err) {
      setError("Erreur lors de l'ajout du joueur");
    }
  };

  const handleEditPlayer = (playerData: PlayerFormData) => {
    if (!editingPlayer) return;
    
    try {
      onUpdatePlayer(editingPlayer.id, playerData);
      setEditingPlayer(null);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la modification du joueur");
    }
  };

  const handleDeletePlayer = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) {
      try {
        onDeletePlayer(id);
        setError(null);
      } catch (err) {
        setError("Erreur lors de la suppression du joueur");
      }
    }
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

  // Mock statistics for demonstration
  const getPlayerStats = (player: Player) => ({
    matches: Math.floor(Math.random() * 20) + 1,
    goals: Math.floor(Math.random() * 15),
    assists: Math.floor(Math.random() * 20),
    points: Math.floor(Math.random() * 30) + 5,
    evaluation: ["A", "B", "C"][Math.floor(Math.random() * 3)] as string,
  });

  const getCampColor = (index: number) => {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"];
    return colors[index % colors.length];
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
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Exporter
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

        {/* Categories */}
        <div className="flex space-x-1 mb-6">
          {categoryCounts.map((category) => (
            <Button
              key={category.id}
              variant={category.active ? "default" : "ghost"}
              className={`${
                category.active 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name} ({category.count})
            </Button>
          ))}
          <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
            <Filter className="w-4 h-4 mr-2" />
            Filtres avancés
          </Button>
        </div>

                {/* Filters */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Camp Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Filtrer par camp d'entraînement</h3>
            <div className="space-y-2">
              {camps.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun camp d'entraînement disponible</p>
              ) : (
                camps.map((camp, index) => {
                  const registeredPlayers = campRegistrations.filter(reg => reg.camp_id === camp.id).length;
                  return (
                    <div
                      key={camp.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        selectedCamp === camp.id ? "bg-red-100 border border-red-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedCamp(selectedCamp === camp.id ? null : camp.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getCampColor(index)}`}></div>
                        <div>
                          <span className="font-medium text-gray-900">{camp.name}</span>
                          <div className="text-xs text-gray-500">{camp.level} • {camp.location}</div>
                        </div>
                      </div>
                      <span className="text-gray-500">({registeredPlayers} joueurs)</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Position Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Filtrer par position</h3>
            <div className="space-y-2">
              {positionCounts.map((pos) => (
                <div
                  key={pos.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    selectedPosition === pos.id ? "bg-red-100 border border-red-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPosition(selectedPosition === pos.id ? null : pos.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full ${pos.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {pos.initial}
                    </div>
                    <span className="text-gray-900">{pos.name}</span>
                  </div>
                  <span className="text-gray-500">({pos.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Players Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCamp 
                ? `Joueurs - ${camps.find(c => c.id === selectedCamp)?.name || 'Camp sélectionné'}`
                : "Tous les joueurs"
              }
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <List className="w-4 h-4" />
              </Button>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Matchs</TableHead>
                  <TableHead>Buts</TableHead>
                  <TableHead>Passes</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Évaluation</TableHead>
                  <TableHead className="w-[50px]">Act</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
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
                    const stats = getPlayerStats(player);
                    return (
                      <TableRow key={player.id} className="border-gray-200 hover:bg-gray-50">
                        <TableCell>
                          <input type="checkbox" className="rounded border-gray-300" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {getInitials(player.first_name, player.last_name)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {player.first_name} {player.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                #{player.jersey_number || "N/A"}
                              </div>
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
                        <TableCell className="text-gray-900">183 cm</TableCell>
                        <TableCell className="text-gray-900">78 kg</TableCell>
                        <TableCell className="text-gray-900">{stats.matches}</TableCell>
                        <TableCell className="text-gray-900">{stats.goals}</TableCell>
                        <TableCell className="text-gray-900">{stats.assists}</TableCell>
                        <TableCell>
                          <span className="text-green-600 font-semibold">{stats.points}</span>
                        </TableCell>
                        <TableCell>
                          <div className={`w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold`}>
                            {stats.evaluation}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-gray-200">
                              <DropdownMenuItem
                                onClick={() => setEditingPlayer(player)}
                                className="text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-gray-700 hover:bg-gray-100">
                                <Eye className="w-4 h-4 mr-2" />
                                Voir profil
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-gray-700 hover:bg-gray-100">
                                <Star className="w-4 h-4 mr-2" />
                                Ajouter aux favoris
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePlayer(player.id)}
                                className="text-red-600 hover:bg-gray-100"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
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
      </div>
    </div>
  );
} 