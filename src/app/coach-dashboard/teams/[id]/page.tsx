"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trophy, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Team } from "@/types/team";
import { Tryout, TryoutFormData } from "@/types/tryout";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromTeamDatabaseFormat } from "@/lib/mappers/teamMapper";
import { fromDatabaseFormat as fromTryoutDatabaseFormat, toDatabaseFormat as toTryoutDatabaseFormat } from "@/lib/mappers/tryoutMapper";
import { handleSupabaseError, showErrorToast, showSuccessToast, setToastCallback } from '@/lib/errorHandling';
import { useToast } from '@/components/ui/toast';
import { TryoutManagement } from "@/components/regular-season/TryoutManagement";
import { RegularSeasonsList } from "@/components/regular-season/RegularSeasonsList";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface TeamStats {
  activeTryouts: number;
  completedTryouts: number;
  totalSeasons: number;
}

export default function TeamDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Handle URL query parameters for direct tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'tryouts', 'seasons'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
  const [stats, setStats] = useState<TeamStats>({
    activeTryouts: 0,
    completedTryouts: 0,
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

      // Calculate stats
      const activeTryouts = tryoutsData?.filter(t => t.status === "active").length || 0;
      const completedTryouts = tryoutsData?.filter(t => t.status === "completed").length || 0;

      // Get total seasons count for this team
      const { data: allSeasonsData } = await supabase
        .from("regular_seasons")
        .select("id")
        .eq("team_id", teamId)
        .eq("coach_id", user.id);

      setStats({
        activeTryouts,
        completedTryouts,
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
        // Only update local tryouts state, don't reload all data to avoid race conditions
        setTryouts([formattedTryout, ...tryouts]);
        showSuccessToast("Tryout créé avec succès pour l&apos;équipe");
        
        // Update stats manually instead of full reload to avoid race conditions
        setStats(prevStats => ({
          ...prevStats,
          activeTryouts: formattedTryout.status === "active" ? prevStats.activeTryouts + 1 : prevStats.activeTryouts,
        }));
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
      // Find the tryout being deleted to update stats correctly
      const deletedTryout = tryouts.find(tryout => tryout.id === id);
      
      const { error } = await supabase.from("tryouts").delete().eq("id", id);

      if (error) {
        const appError = handleSupabaseError(error);
        showErrorToast(appError);
        return;
      }

      setTryouts(tryouts.filter((tryout) => tryout.id !== id));
      showSuccessToast("Tryout supprimé avec succès");
      
      // Update stats manually instead of full reload to avoid race conditions
      if (deletedTryout) {
        setStats(prevStats => ({
          ...prevStats,
          activeTryouts: deletedTryout.status === "active" ? prevStats.activeTryouts - 1 : prevStats.activeTryouts,
          completedTryouts: deletedTryout.status === "completed" ? prevStats.completedTryouts - 1 : prevStats.completedTryouts,
        }));
      }
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
                  {stats.totalSeasons > 0 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {stats.totalSeasons} Saison{stats.totalSeasons > 1 ? 's' : ''}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalSeasons}
            </div>
            <div className="text-sm text-gray-600">Saisons Régulières</div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="tryouts" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Tryouts ({tryouts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="seasons" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Saisons Régulières ({stats.totalSeasons})</span>
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

                {/* Seasons Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Saisons Régulières</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total des saisons:</span>
                      <span className="font-medium">{stats.totalSeasons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tryouts actifs:</span>
                      <span className="font-medium">{stats.activeTryouts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tryouts terminés:</span>
                      <span className="font-medium">{stats.completedTryouts}</span>
                    </div>
                  </div>
                  {stats.totalSeasons === 0 && (
                    <div className="text-gray-600 text-sm">
                      Aucune saison créée. Créez un tryout et terminez-le pour générer une saison automatiquement.
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
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("seasons")}
                  >
                    Gérer les Saisons
                  </Button>
                  {stats.totalSeasons > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/coach-dashboard/seasons`)}
                    >
                      Voir toutes les Saisons
                    </Button>
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

          <TabsContent value="seasons">
            <RegularSeasonsList 
              team={team} 
              onStatsChange={() => {
                // Reload stats when seasons change
                loadTeamData();
              }} 
            />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}