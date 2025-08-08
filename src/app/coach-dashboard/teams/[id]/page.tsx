"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowLeft, Plus, Trophy, CheckCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Team } from "@/types/team";
import { Tryout, TryoutFormData } from "@/types/tryout";
import { RegularSeason } from "@/types/regularSeason";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromTeamDatabaseFormat } from "@/lib/mappers/teamMapper";
import { fromDatabaseFormat as fromTryoutDatabaseFormat, toDatabaseFormat as toTryoutDatabaseFormat } from "@/lib/mappers/tryoutMapper";
import { fromDatabaseFormat as fromRegularSeasonDatabaseFormat } from "@/lib/mappers/regularSeasonMapper";
import { handleSupabaseError, showErrorToast, showSuccessToast, setToastCallback } from '@/lib/errorHandling';
import { useToast } from '@/components/ui/toast';
import { TryoutManagement } from "@/components/regular-season/TryoutManagement";
import { RegularSeasonPlayers } from "@/components/regular-season/RegularSeasonPlayers";
import { RegularSeasonSchedule } from "@/components/regular-season/RegularSeasonSchedule";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface TeamStats {
  activeTryouts: number;
  completedTryouts: number;
  currentSeasonPlayers: number;
  totalSeasons: number;
}

export default function TeamDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [currentSeason, setCurrentSeason] = useState<RegularSeason | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<TeamStats>({
    activeTryouts: 0,
    completedTryouts: 0,
    currentSeasonPlayers: 0,
    totalSeasons: 0,
  });

  // Set up toast callback
  useEffect(() => {
    setToastCallback(addToast);
  }, [addToast]);

  // Load team data and related information
  const loadTeamData = useCallback(async () => {
    try {
      setError(null);
      const { id: teamId } = await params;

      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Utilisateur non authentifié");
        return;
      }

      // Load team data
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .eq("coach_id", user.id)
        .single();

      if (teamError) {
        const appError = handleSupabaseError(teamError);
        showErrorToast(appError);
        setError(`Erreur lors du chargement de l&apos;équipe: ${appError.message}`);
        return;
      }

      const formattedTeam = fromTeamDatabaseFormat(teamData);
      setTeam(formattedTeam);

      // Load team's tryouts
      const { data: tryoutsData, error: tryoutsError } = await supabase
        .from("tryouts")
        .select("*")
        .eq("team_id", teamId)
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (tryoutsError) {
        const appError = handleSupabaseError(tryoutsError);
        showErrorToast(appError);
      } else {
        const formattedTryouts = (tryoutsData || []).map(fromTryoutDatabaseFormat);
        setTryouts(formattedTryouts);
      }

      // Load current season (active season for this team)
      console.log("🔄 Looking for regular season for team:", teamId);
      const { data: seasonData, error: seasonError } = await supabase
        .from("regular_seasons")
        .select("*")
        .eq("team_id", teamId)
        .eq("coach_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (seasonError) {
        console.error("❌ Error loading regular season:", seasonError);
        const appError = handleSupabaseError(seasonError);
        showErrorToast(appError);
      } else if (seasonData) {
        console.log("✅ Found regular season:", seasonData);
        const formattedSeason = fromRegularSeasonDatabaseFormat(seasonData);
        setCurrentSeason(formattedSeason);
      } else {
        console.log("⚠️ No active regular season found for team:", teamId);
        setCurrentSeason(null);
      }

      // Calculate stats
      const activeTryouts = tryoutsData?.filter(t => t.status === "active").length || 0;
      const completedTryouts = tryoutsData?.filter(t => t.status === "completed").length || 0;

      // Get current season player count
      let currentSeasonPlayers = 0;
      if (seasonData) {
        const { data: playersData } = await supabase
          .from("regular_season_players")
          .select("id")
          .eq("regular_season_id", seasonData.id);
        currentSeasonPlayers = playersData?.length || 0;
      }

      // Get total seasons count for this team
      const { data: allSeasonsData } = await supabase
        .from("regular_seasons")
        .select("id")
        .eq("team_id", teamId)
        .eq("coach_id", user.id);

      setStats({
        activeTryouts,
        completedTryouts,
        currentSeasonPlayers,
        totalSeasons: allSeasonsData?.length || 0,
      });

    } catch (error) {
      const appError = handleSupabaseError(error as Error);
      showErrorToast(appError);
      setError(`Erreur lors du chargement des données: ${appError.message}`);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);



  const handleAddTryout = async (tryoutData: TryoutFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !team) {
        const error = { message: "Utilisateur non authentifié ou équipe non trouvée" };
        showErrorToast(error);
        return;
      }

      const { data, error } = await supabase
        .from("tryouts")
        .insert([
          {
            ...toTryoutDatabaseFormat(tryoutData),
            coach_id: user.id,
            team_id: team.id,
          },
        ])
        .select()
        .single();

      if (error) {
        const appError = handleSupabaseError(error);
        showErrorToast(appError);
        return;
      }

      if (data) {
        const formattedTryout = fromTryoutDatabaseFormat(data);
        setTryouts([formattedTryout, ...tryouts]);
        showSuccessToast("Tryout créé avec succès pour l&apos;équipe");
        // Refresh stats
        await loadTeamData();
      }
    } catch (error) {
      const appError = handleSupabaseError(error as Error);
      showErrorToast(appError);
    }
  };

  const handleUpdateTryout = async (id: string, updates: Partial<TryoutFormData>) => {
    try {
      const { data, error } = await supabase
        .from("tryouts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        const appError = handleSupabaseError(error);
        showErrorToast(appError);
        return;
      }

      if (data) {
        const formattedTryout = fromTryoutDatabaseFormat(data);
        setTryouts(tryouts.map((tryout) => (tryout.id === id ? formattedTryout : tryout)));
        showSuccessToast("Tryout modifié avec succès");
      }
    } catch (error) {
      const appError = handleSupabaseError(error as Error);
      showErrorToast(appError);
    }
  };

  const handleDeleteTryout = async (id: string) => {
    try {
      const { error } = await supabase.from("tryouts").delete().eq("id", id);

      if (error) {
        const appError = handleSupabaseError(error);
        showErrorToast(appError);
        return;
      }

      setTryouts(tryouts.filter((tryout) => tryout.id !== id));
      showSuccessToast("Tryout supprimé avec succès");
      // Refresh stats
      await loadTeamData();
    } catch (error) {
      const appError = handleSupabaseError(error as Error);
      showErrorToast(appError);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement de l&apos;équipe...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || "Équipe non trouvée"}</div>
          <Button onClick={() => router.push("/coach-dashboard/teams")}>
            Retour aux équipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/coach-dashboard/teams")}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-3 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {team.name}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="outline">{team.level}</Badge>
                  {currentSeason && (
                    <Badge className="bg-green-100 text-green-800">
                      Saison Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setActiveTab("tryouts")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouveau Tryout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.activeTryouts}
            </div>
            <div className="text-sm text-gray-600">Tryouts Actifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.completedTryouts}
            </div>
            <div className="text-sm text-gray-600">Tryouts Terminés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.currentSeasonPlayers}
            </div>
            <div className="text-sm text-gray-600">Joueurs Actifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalSeasons}
            </div>
            <div className="text-sm text-gray-600">Saisons Total</div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="tryouts" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Tryouts ({tryouts.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="season" 
              className="flex items-center space-x-2"
              disabled={!currentSeason}
            >
              <Trophy className="w-4 h-4" />
              <span>Saison Régulière</span>
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="flex items-center space-x-2"
              disabled={!currentSeason}
            >
              <Calendar className="w-4 h-4" />
              <span>Horaire</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Joueurs ({stats.currentSeasonPlayers})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Aperçu de l&apos;Équipe {team.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Team Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Informations de l&apos;Équipe</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom:</span>
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Niveau:</span>
                      <Badge variant="outline">{team.level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Créée le:</span>
                      <span className="font-medium">
                        {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Season */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Saison Actuelle</h3>
                  {currentSeason ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom de la saison:</span>
                        <span className="font-medium">{currentSeason.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut:</span>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Joueurs:</span>
                        <span className="font-medium">{stats.currentSeasonPlayers}</span>
                      </div>
                      {currentSeason.start_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Début:</span>
                          <span className="font-medium">
                            {new Date(currentSeason.start_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">
                      Aucune saison active. Créez un tryout et terminez-le pour démarrer une saison.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions Rapides</h3>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setActiveTab("tryouts")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Créer un Tryout
                  </Button>
                  {currentSeason && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("season")}
                      >
                        Gérer la Saison
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("players")}
                      >
                        Gérer les Joueurs
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tryouts">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <TryoutManagement
                tryouts={tryouts}
                onAddTryout={handleAddTryout}
                onUpdateTryout={handleUpdateTryout}
                onDeleteTryout={handleDeleteTryout}
                teamContext={team}
              />
            </div>
          </TabsContent>

          <TabsContent value="season">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {currentSeason ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Saison Régulière: {currentSeason.name}
                    </h2>
                    <Button
                      onClick={() => router.push(`/coach-dashboard/seasons/${currentSeason.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Trophy className="h-4 w-4" />
                      Gestion Avancée
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Season Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Détails de la Saison</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nom:</span>
                          <span className="font-medium">{currentSeason.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        {currentSeason.level && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Niveau:</span>
                            <span className="font-medium">{currentSeason.level}</span>
                          </div>
                        )}
                        {currentSeason.location && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lieu:</span>
                            <span className="font-medium">{currentSeason.location}</span>
                          </div>
                        )}
                        {currentSeason.start_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date de début:</span>
                            <span className="font-medium">
                              {new Date(currentSeason.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {currentSeason.end_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date de fin:</span>
                            <span className="font-medium">
                              {new Date(currentSeason.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Season Stats */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Statistiques</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {stats.currentSeasonPlayers}
                          </div>
                          <div className="text-sm text-blue-600">Joueurs Actifs</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {stats.totalSeasons}
                          </div>
                          <div className="text-sm text-green-600">Saisons Total</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions for Season */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("players")}
                        className="flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Gérer les Joueurs
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/coach-dashboard/seasons/${currentSeason.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Trophy className="h-4 w-4" />
                        Gestion Complète
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  {currentSeason.description && (
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{currentSeason.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune saison régulière active
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Terminez un tryout pour créer une saison régulière pour cette équipe.
                  </p>
                  <Button
                    onClick={() => setActiveTab("tryouts")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Voir les Tryouts
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {currentSeason ? (
                <RegularSeasonSchedule seasonId={currentSeason.id} />
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune saison active
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Créez et terminez un tryout pour démarrer une saison régulière et voir l&apos;horaire.
                  </p>
                  <Button
                    onClick={() => setActiveTab("tryouts")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Créer un Tryout
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="players">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {currentSeason ? (
                <RegularSeasonPlayers seasonId={currentSeason.id} />
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune saison active
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Créez et terminez un tryout pour démarrer une saison régulière.
                  </p>
                  <Button
                    onClick={() => setActiveTab("tryouts")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Créer un Tryout
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}