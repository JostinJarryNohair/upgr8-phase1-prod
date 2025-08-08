"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegularSeason } from "@/types/regularSeason";
import { Team } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Calendar, 
  Users, 
  Plus,
  ArrowRight,
  Clock,
  MapPin
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromRegularSeasonDatabaseFormat } from "@/lib/mappers/regularSeasonMapper";
import { handleSupabaseError, showErrorToast, showSuccessToast } from '@/lib/errorHandling';

interface RegularSeasonsListProps {
  team: Team;
  onStatsChange?: () => void;
}

interface SeasonStats {
  playersCount: number;
  gamesCount: number;
}

export function RegularSeasonsList({ team, onStatsChange }: RegularSeasonsListProps) {
  const router = useRouter();
  const [seasons, setSeasons] = useState<RegularSeason[]>([]);
  const [seasonsStats, setSeasonsStats] = useState<Record<string, SeasonStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all regular seasons for this team
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        setError(null);
        
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Utilisateur non authentifié");
          return;
        }

        // Load all seasons for this team
        const { data: seasonsData, error: seasonsError } = await supabase
          .from("regular_seasons")
          .select("*")
          .eq("team_id", team.id)
          .eq("coach_id", user.id)
          .order("created_at", { ascending: false });

        if (seasonsError) {
          const appError = handleSupabaseError(seasonsError);
          showErrorToast(appError);
          setError(`Erreur lors du chargement des saisons: ${appError.message}`);
          return;
        }

        const formattedSeasons = (seasonsData || []).map(fromRegularSeasonDatabaseFormat);
        setSeasons(formattedSeasons);

        // Load stats for each season
        const statsPromises = formattedSeasons.map(async (season) => {
          const [playersResult, gamesResult] = await Promise.all([
            // Get players count for this season
            supabase
              .from("regular_season_players")
              .select("id")
              .eq("regular_season_id", season.id),
            // Get games count for this season (if games table exists)
            supabase
              .from("games")
              .select("id")
              .eq("regular_season_id", season.id)
              .then(result => result)
              .catch(() => ({ data: [] })) // Games table might not exist yet
          ]);

          return {
            seasonId: season.id,
            stats: {
              playersCount: playersResult.data?.length || 0,
              gamesCount: gamesResult.data?.length || 0
            }
          };
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap = statsResults.reduce((acc, { seasonId, stats }) => {
          acc[seasonId] = stats;
          return acc;
        }, {} as Record<string, SeasonStats>);

        setSeasonsStats(statsMap);

      } catch (error) {
        const appError = handleSupabaseError(error as Error);
        showErrorToast(appError);
        setError(`Erreur lors du chargement des données: ${appError.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadSeasons();
  }, [team.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-gray-600">Terminée</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Planifiée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSeasonClick = (season: RegularSeason) => {
    router.push(`/coach-dashboard/seasons/${season.id}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <div className="text-gray-600">Chargement des saisons...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Saisons Régulières
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez les saisons régulières de l'équipe {team.name}
          </p>
        </div>
        <Button
          onClick={() => router.push(`/coach-dashboard/teams/${team.id}/create-season`)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Saison
        </Button>
      </div>

      {/* Seasons List */}
      {seasons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune saison régulière
            </h3>
            <p className="text-gray-600 mb-4">
              Créez et terminez des tryouts pour générer des saisons régulières automatiquement,
              ou créez une nouvelle saison manuellement.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => router.push(`/coach-dashboard/teams/${team.id}?tab=tryouts`)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Gérer les Tryouts
              </Button>
              <Button
                onClick={() => router.push(`/coach-dashboard/teams/${team.id}/create-season`)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer une Saison
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasons.map((season) => {
            const stats = seasonsStats[season.id] || { playersCount: 0, gamesCount: 0 };
            
            return (
              <div
                key={season.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSeasonClick(season)}
              >
                {/* Season Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {season.name}
                      </h3>
                    </div>
                    {getStatusBadge(season.status)}
                  </div>
                  
                  {season.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {season.description}
                    </p>
                  )}

                  {/* Season Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {season.level && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {season.level}
                        </Badge>
                      </div>
                    )}
                    
                    {season.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{season.location}</span>
                      </div>
                    )}

                    {season.start_date && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(season.start_date).toLocaleDateString()}
                          {season.end_date && (
                            <span> - {new Date(season.end_date).toLocaleDateString()}</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Season Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.playersCount}
                      </div>
                      <div className="text-xs text-gray-600">Joueurs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.gamesCount}
                      </div>
                      <div className="text-xs text-gray-600">Matchs</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeasonClick(season);
                    }}
                    className="w-full flex items-center justify-center gap-2"
                    size="sm"
                  >
                    Gérer la Saison
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}