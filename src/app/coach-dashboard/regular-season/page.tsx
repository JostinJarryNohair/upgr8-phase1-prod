"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Team } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromTeamDatabaseFormat } from "@/lib/mappers/teamMapper";
import { handleSupabaseError, showErrorToast, showSuccessToast, setToastCallback } from '@/lib/errorHandling';
import { useToast } from '@/components/ui/toast';
import { AddTeamModal } from "@/components/teams/AddTeamModal";
import { TeamFormData } from "@/types/team";
import { toDatabaseFormat as toTeamDatabaseFormat } from "@/lib/mappers/teamMapper";

interface TeamWithStats extends Team {
  activeTryouts: number;
  currentSeasonPlayers: number;
  hasActiveSeason: boolean;
}

export default function RegularSeasonPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [teams, setTeams] = useState<TeamWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);

  // Set up toast callback
  useEffect(() => {
    setToastCallback(addToast);
  }, [addToast]);

  // Load teams with stats
  useEffect(() => {
    const loadTeamsWithStats = async () => {
      try {
        setError(null);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Utilisateur non authentifié");
          setLoading(false);
          return;
        }

        // Load teams
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("*")
          .eq("coach_id", user.id)
          .order("created_at", { ascending: false });

        if (teamsError) {
          const appError = handleSupabaseError(teamsError);
          showErrorToast(appError);
          setError(`Erreur lors du chargement des équipes: ${appError.message}`);
          return;
        }

        // For each team, get stats
        const teamsWithStats: TeamWithStats[] = await Promise.all(
          (teamsData || []).map(async (teamData) => {
            const team = fromTeamDatabaseFormat(teamData);

            // Get active tryouts count
            const { data: tryoutsData } = await supabase
              .from("tryouts")
              .select("id")
              .eq("team_id", team.id)
              .eq("status", "active");

            // Check for active season
            const { data: activeSeasonData } = await supabase
              .from("regular_seasons")
              .select("id")
              .eq("team_id", team.id)
              .eq("status", "active")
              .maybeSingle();

            // Get current season players count
            let currentSeasonPlayers = 0;
            if (activeSeasonData) {
              const { data: playersData } = await supabase
                .from("regular_season_players")
                .select("id")
                .eq("regular_season_id", activeSeasonData.id);
              currentSeasonPlayers = playersData?.length || 0;
            }

            return {
              ...team,
              activeTryouts: tryoutsData?.length || 0,
              currentSeasonPlayers,
              hasActiveSeason: !!activeSeasonData,
            };
          })
        );

        setTeams(teamsWithStats);
      } catch (error) {
        const appError = handleSupabaseError(error as Error);
        showErrorToast(appError);
        setError(`Erreur lors du chargement des données: ${appError.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadTeamsWithStats();
  }, [addToast]);

  const handleAddTeam = async (teamData: TeamFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const error = { message: "Utilisateur non authentifié" };
        showErrorToast(error);
        return;
      }

      const teamDbData = toTeamDatabaseFormat(teamData, user.id);

      const { data, error } = await supabase
        .from("teams")
        .insert(teamDbData)
        .select()
        .single();

      if (error) {
        const appError = handleSupabaseError(error);
        showErrorToast(appError);
        return;
      }

      if (data) {
        const formattedTeam = fromTeamDatabaseFormat(data);
        const newTeamWithStats: TeamWithStats = {
          ...formattedTeam,
          activeTryouts: 0,
          currentSeasonPlayers: 0,
          hasActiveSeason: false,
        };
        setTeams([newTeamWithStats, ...teams]);
        setIsAddTeamModalOpen(false);
        showSuccessToast("Équipe créée avec succès");
      }
    } catch (error) {
      const appError = handleSupabaseError(error as Error);
      showErrorToast(appError);
    }
  };

  // Filter teams based on search
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Chargement de vos équipes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Équipes</h1>
              <p className="text-gray-600 mt-2">
                Gérez vos équipes, leurs tryouts et saisons régulières.
              </p>
            </div>
            <Button
              onClick={() => setIsAddTeamModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle Équipe
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-800">
                <strong>Erreur:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
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

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {teams.length === 0 ? "Aucune équipe créée" : "Aucune équipe trouvée"}
            </h3>
            <p className="text-gray-600 mb-6">
              {teams.length === 0 
                ? "Créez votre première équipe pour commencer à gérer tryouts et saisons régulières."
                : "Aucune équipe ne correspond à votre recherche."
              }
            </p>
            {teams.length === 0 && (
              <Button
                onClick={() => setIsAddTeamModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer ma première équipe
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => router.push(`/coach-dashboard/regular-season/team/${team.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:bg-gray-50 hover:border-blue-200"
              >
                {/* Team Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {team.name}
                    </h3>
                    <Badge className={getLevelBadgeColor(team.level)}>
                      {team.level}
                    </Badge>
                  </div>
                  {team.hasActiveSeason && (
                    <Badge className="bg-green-100 text-green-800 ml-2">
                      Saison Active
                    </Badge>
                  )}
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {team.activeTryouts}
                    </div>
                    <div className="text-xs text-gray-600">Tryouts Actifs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {team.currentSeasonPlayers}
                    </div>
                    <div className="text-xs text-gray-600">Joueurs Actifs</div>
                  </div>
                </div>

                {/* Team Actions Hint */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Trophy className="w-4 h-4 mr-1" />
                      <span>Créée le {new Date(team.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      Gérer →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Team Modal */}
        <AddTeamModal
          isOpen={isAddTeamModalOpen}
          onClose={() => setIsAddTeamModalOpen(false)}
          onSubmit={handleAddTeam}
        />
      </div>
    </div>
  );
} 