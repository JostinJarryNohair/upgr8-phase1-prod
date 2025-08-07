"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegularSeason } from "@/types/regularSeason";
import { Team } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Search, MapPin, Users, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromRegularSeasonDatabaseFormat } from "@/lib/mappers/regularSeasonMapper";
import { fromDatabaseFormat as fromTeamDatabaseFormat } from "@/lib/mappers/teamMapper";
import { handleSupabaseError, showErrorToast, setToastCallback } from '@/lib/errorHandling';
import { useToast } from '@/components/ui/toast';

interface SeasonWithTeam extends RegularSeason {
  team?: Team;
  playerCount?: number;
}

export default function SeasonsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [seasons, setSeasons] = useState<SeasonWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Set up toast callback
  useEffect(() => {
    setToastCallback(addToast);
  }, [addToast]);

  // Load seasons with team info
  useEffect(() => {
    const loadSeasons = async () => {
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

        // Load seasons with team information
        const { data: seasonsData, error: seasonsError } = await supabase
          .from("regular_seasons")
          .select(`
            *,
            team:teams(*)
          `)
          .eq("coach_id", user.id)
          .order("created_at", { ascending: false });

        if (seasonsError) {
          const appError = handleSupabaseError(seasonsError);
          showErrorToast(appError);
          setError(`Erreur lors du chargement des saisons: ${appError.message}`);
          return;
        }

        // Format seasons with team data and get player counts
        const formattedSeasons = await Promise.all(
          (seasonsData || []).map(async (seasonData) => {
            const season = fromRegularSeasonDatabaseFormat(seasonData);
            const team = seasonData.team ? fromTeamDatabaseFormat(seasonData.team) : undefined;

            // Get player count for this season
            const { data: playersData } = await supabase
              .from("regular_season_players")
              .select("id")
              .eq("regular_season_id", season.id);

            return {
              ...season,
              team,
              playerCount: playersData?.length || 0,
            };
          })
        );

        setSeasons(formattedSeasons);
      } catch (error) {
        const appError = handleSupabaseError(error as Error);
        showErrorToast(appError);
        setError(`Erreur lors du chargement des données: ${appError.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadSeasons();
  }, [addToast]);

  // Filter seasons
  const filteredSeasons = seasons.filter(season => {
    const matchesSearch = 
      season.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      season.team?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      season.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || season.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "active": return "Active";
      case "completed": return "Terminée";
      case "cancelled": return "Annulée";
      default: return "Inconnue";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Chargement des saisons...</div>
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
              <h1 className="text-3xl font-bold">Saisons Régulières</h1>
              <p className="text-gray-600 mt-2">
                Vue d'ensemble de toutes vos saisons régulières.
              </p>
            </div>
            <Button
              onClick={() => router.push("/coach-dashboard/teams")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Gérer via Équipes
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              <strong>Erreur:</strong> {error}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une saison, une équipe ou un lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>

        {/* Seasons List */}
        {filteredSeasons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {seasons.length === 0 ? "Aucune saison créée" : "Aucune saison trouvée"}
            </h3>
            <p className="text-gray-600 mb-6">
              {seasons.length === 0 
                ? "Les saisons sont créées après la fin des tryouts depuis la page de chaque équipe."
                : "Aucune saison ne correspond à vos critères de recherche."
              }
            </p>
            {seasons.length === 0 && (
              <Button
                onClick={() => router.push("/coach-dashboard/teams")}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Aller aux équipes
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeasons.map((season) => (
              <div
                key={season.id}
                onClick={() => router.push(`/coach-dashboard/seasons/${season.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
              >
                {/* Season Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {season.name}
                    </h3>
                    <Badge className={getStatusColor(season.status)}>
                      {getStatusLabel(season.status)}
                    </Badge>
                  </div>
                </div>

                {/* Team Info */}
                {season.team && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Trophy className="w-4 h-4" />
                    <span>{season.team.name} - {season.team.level}</span>
                  </div>
                )}

                {/* Season Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {season.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(season.start_date)} - {formatDate(season.end_date)}</span>
                    </div>
                  )}
                  {season.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{season.location}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{season.playerCount || 0} joueurs</span>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      Voir détails →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}