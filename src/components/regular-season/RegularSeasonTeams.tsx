"use client";

import { useState, useEffect } from "react";
import { Team, TeamFormData } from "@/types/team";
import { AddTeamModal } from "@/components/teams/AddTeamModal";
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
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus,
  Users, 
  Trophy,
  XCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromTeamDatabaseFormat } from "@/lib/mappers/teamMapper";
import { toDatabaseFormat as toTeamDatabaseFormat } from "@/lib/mappers/teamMapper";

interface RegularSeasonTeamsProps {
  seasonId: string;
}

const getLevelBadgeColor = (level: string) => {
  const levelColors: Record<string, string> = {
    "U7": "bg-blue-100 text-blue-800",
    "U9": "bg-green-100 text-green-800",
    "U11": "bg-yellow-100 text-yellow-800",
    "U13": "bg-purple-100 text-purple-800",
    "U15": "bg-indigo-100 text-indigo-800",
    "U18": "bg-pink-100 text-pink-800",
    "Junior": "bg-red-100 text-red-800",
    "Senior": "bg-gray-100 text-gray-800",
    "M13": "bg-orange-100 text-orange-800",
    "M15": "bg-teal-100 text-teal-800",
    "M18": "bg-cyan-100 text-cyan-800",
  };
  
  return levelColors[level] || "bg-gray-100 text-gray-800";
};

export function RegularSeasonTeams({ seasonId }: RegularSeasonTeamsProps) {
  console.log("seasonId", seasonId);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load teams for this coach
  useEffect(() => {
    const loadTeams = async () => {
      try {
        // Get authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.error("No authenticated user");
          return;
        }

        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .eq("coach_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading teams:", error);
          return;
        }

        const formattedTeams = (data || []).map(fromTeamDatabaseFormat);
        setTeams(formattedTeams);
      } catch (error) {
        console.error("Error loading teams:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  // Filter teams based on search and filters
  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchTerm === "" || 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.level.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === "all" || team.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const handleAddTeam = async (teamData: TeamFormData) => {
    try {
      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user");
        return;
      }

      const teamDbData = toTeamDatabaseFormat(teamData, user.id);

      const { data: newTeam, error } = await supabase
        .from("teams")
        .insert(teamDbData)
        .select()
        .single();

      if (error) {
        console.error("Error creating team:", error);
        return;
      }

      if (newTeam) {
        const formattedTeam = fromTeamDatabaseFormat(newTeam);
        setTeams(prev => [formattedTeam, ...prev]);
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding team:", error);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) {
        console.error("Error removing team:", error);
        return;
      }

      setTeams(prev => prev.filter(t => t.id !== teamId));
    } catch (error) {
      console.error("Error removing team:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Chargement des équipes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Équipes de la Saison Régulière
          </h2>
          <p className="text-sm text-gray-600">
            Gérez les équipes de cette saison
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une Équipe
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une équipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les niveaux</option>
          <option value="U7">U7</option>
          <option value="U9">U9</option>
          <option value="U11">U11</option>
          <option value="U13">U13</option>
          <option value="U15">U15</option>
          <option value="U18">U18</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
          <option value="M13">M13</option>
          <option value="M15">M15</option>
          <option value="M18">M18</option>
        </select>
      </div>

      {/* Teams Table */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune équipe trouvée
          </h3>
          <p className="text-gray-600">
            {teams.length === 0 
              ? "Aucune équipe n'a été créée pour cette saison."
              : "Aucune équipe ne correspond à vos critères de recherche."
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Équipe</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-gray-500">
                          ID: {team.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getLevelBadgeColor(team.level)}>
                      {team.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {formatDate(team.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/coach-dashboard/teams/${team.id}`}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTeam(team.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modals */}
      <AddTeamModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTeam}
      />
    </div>
  );
} 