"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, ArrowLeft, Eye, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tryout } from "@/types/tryout";
import { RegularSeasonFormData } from "@/types/regularSeason";
import { Player } from "@/types/player";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat } from "@/lib/mappers/tryoutMapper";
import { TryoutPlayers } from "@/components/regular-season/tryout/TryoutPlayers";
import { EndTryoutModal } from "@/components/regular-season/tryout/EndTryoutModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface TryoutStats {
  totalPlayers: number;
  selectedPlayers: number;
  cutPlayers: number;
  totalRegistrations: number;
}

export default function TryoutDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [tryout, setTryout] = useState<Tryout | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<TryoutStats>({
    totalPlayers: 0,
    selectedPlayers: 0,
    cutPlayers: 0,
    totalRegistrations: 0,
  });

  // Separate function to load player stats (can be called multiple times)
  const loadPlayerStats = async (tryoutId: string) => {
    try {
      // Load player stats for this tryout
      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("tryout_registrations")
          .select(
            `
          *,
          player:players (
            id,
            first_name,
            last_name,
            email,
            is_active
          )
        `
          )
          .eq("tryout_id", tryoutId);

      if (registrationsError) {
        console.error("Error loading registrations:", registrationsError);
        return;
      }

      // Calculate stats and extract selected players
      if (registrationsData) {
        const totalRegistrations = registrationsData.length;
        // Include confirmed, pending, and attended players as "selected" (not cancelled)
        const selectedPlayersData = registrationsData.filter(
          (reg) => reg.status !== "cancelled"
        );
        const cutPlayers = registrationsData.filter(
          (reg) => reg.status === "cancelled"
        ).length;
        const totalPlayers = registrationsData.filter(
          (reg) => reg.status !== "cancelled"
        ).length;

        setStats({
          totalPlayers,
          selectedPlayers: selectedPlayersData.length,
          cutPlayers,
          totalRegistrations,
        });

        // Extract selected players for the modal
        const playersForSeason = selectedPlayersData
          .map(reg => reg.player)
          .filter(player => player !== null);
        setSelectedPlayers(playersForSeason);
        
        console.log(`🔄 Stats updated: ${selectedPlayersData.length} selected players`);
      }
    } catch (error) {
      console.error("Error loading player stats:", error);
    }
  };

  useEffect(() => {
    const loadTryoutAndStats = async () => {
      try {
        const { id } = await params;

        // Get authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.error("No authenticated user");
          return;
        }

        // Load tryout data from database
        const { data: tryoutData, error: tryoutError } = await supabase
          .from("tryouts")
          .select("*")
          .eq("id", id)
          .eq("coach_id", user.id)
          .single();

        if (tryoutError) {
          console.error("Error loading tryout:", tryoutError);
          return;
        }

        if (tryoutData) {
          const formattedTryout = fromDatabaseFormat(tryoutData);
          setTryout(formattedTryout);
        }

        // Load initial player stats
        await loadPlayerStats(id);
        
      } catch (error) {
        console.error("Error loading tryout:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTryoutAndStats();
  }, [params]);

  // Handle tab change and reload stats when switching to overview
  const handleTabChange = async (newTab: string) => {
    setActiveTab(newTab);
    if (newTab === "overview" && tryout) {
      console.log("🔄 Reloading stats due to tab change to overview");
      await loadPlayerStats(tryout.id);
    }
  };

  const getStatusColor = () => {
    if (!tryout) return "bg-gray-100 text-gray-800";
    
    switch (tryout.status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    if (!tryout) return "Unknown";
    
    switch (tryout.status) {
      case "active": return "Actif";
      case "completed": return "Terminé";
      case "cancelled": return "Annulé";
      default: return tryout.status;
    }
  };

  const handleEndTryout = async (regularSeasonData: RegularSeasonFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log("🔄 Creating regular season for team:", tryout?.team_id);
      // Tryout loaded - sensitive data removed from logs
      console.log("🔄 Regular season data:", regularSeasonData);

      // 1. Create the regular season in the regular_seasons table
      const seasonInsertData = {
        name: regularSeasonData.name,
        description: regularSeasonData.description,
        start_date: regularSeasonData.start_date,
        end_date: regularSeasonData.end_date,
        location: regularSeasonData.location,
        level: regularSeasonData.level,
        status: "active",
        coach_id: user.id,
        team_id: tryout?.team_id, // Link the season to the same team as the tryout
      };

      // Creating season - sensitive data removed from logs

      const { data: newSeasonData, error: seasonError } = await supabase
        .from("regular_seasons")
        .insert(seasonInsertData)
        .select()
        .single();

      if (seasonError) {
        console.error("❌ Season creation error:", seasonError);
        throw seasonError;
      }

      // Season created successfully - sensitive data removed from logs

      // 2. Add selected players to the regular_season_players table
      if (selectedPlayers.length > 0) {
        const playerRegistrations = selectedPlayers.map(player => ({
          regular_season_id: newSeasonData.id,
          player_id: player.id,
          status: "active", // Players start as active in regular season
          notes: `Transferred from tryout: ${tryout?.name}`
        }));

        const { error: registrationError } = await supabase
          .from("regular_season_players")
          .insert(playerRegistrations);

        if (registrationError) throw registrationError;
      }

      // 3. Mark current tryout as completed
      const { error: updateError } = await supabase
        .from("tryouts")
        .update({ status: "completed" })
        .eq("id", (await params).id);

      if (updateError) throw updateError;

      // 4. Navigate back to team page to see the new regular season
      console.log("✅ Tryout ended successfully, navigating back to team:", tryout?.team_id);
      if (tryout?.team_id) {
        router.push(`/coach-dashboard/teams/${tryout.team_id}`);
      } else {
        console.log("⚠️ No team_id found on tryout, going to main page");
        router.push("/coach-dashboard/teams");
      }
    } catch (error) {
      console.error("Error ending tryout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement du tryout...</div>
      </div>
    );
  }

  if (!tryout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Tryout non trouvé</div>
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
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-3 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {tryout.name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    {tryout.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{tryout.location}</span>
                      </div>
                    )}
                    {(tryout.start_date || tryout.end_date) && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {tryout.start_date ? new Date(tryout.start_date).toLocaleDateString() : ""} 
                          {tryout.start_date && tryout.end_date ? " - " : ""}
                          {tryout.end_date ? new Date(tryout.end_date).toLocaleDateString() : ""}
                        </span>
                      </div>
                    )}
                    <Badge className={getStatusColor()}>
                      {getStatusText()}
                    </Badge>
                    {tryout.level && <Badge variant="outline">{tryout.level}</Badge>}
                  </div>
                </div>
              </div>
            </div>
            {/* End Tryout Button */}
            {tryout.status === "active" && (
              <Button
                onClick={async () => {
                  console.log("🔄 Reloading stats before opening end tryout modal");
                  await loadPlayerStats(tryout.id);
                  setIsEndModalOpen(true);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Terminer le Tryout
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-8 py-6 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalPlayers}
            </div>
            <div className="text-sm text-gray-600">Joueurs Actifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.selectedPlayers}
            </div>
            <div className="text-sm text-gray-600">Sélectionnés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.cutPlayers}
            </div>
            <div className="text-sm text-gray-600">Retranchés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalRegistrations}
            </div>
            <div className="text-sm text-gray-600">Total Inscriptions</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-8 py-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Aperçu</span>
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Joueurs ({stats.totalPlayers})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Aperçu du Tryout
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails du Tryout
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom:</span>
                      <span className="font-medium">{tryout.name}</span>
                    </div>
                    {tryout.level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Niveau:</span>
                        <span className="font-medium">{tryout.level}</span>
                      </div>
                    )}
                    {tryout.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lieu:</span>
                        <span className="font-medium">{tryout.location}</span>
                      </div>
                    )}
                    {tryout.start_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date de début:</span>
                        <span className="font-medium">
                          {new Date(tryout.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {tryout.end_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date de fin:</span>
                        <span className="font-medium">
                          {new Date(tryout.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <Badge className={getStatusColor()}>
                        {getStatusText()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Statistiques des Joueurs
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joueurs Actifs:</span>
                      <span className="font-medium">{stats.totalPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sélectionnés:</span>
                      <span className="font-medium text-green-600">
                        {stats.selectedPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retranchés:</span>
                      <span className="font-medium text-red-600">
                        {stats.cutPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Inscriptions:
                      </span>
                      <span className="font-medium text-blue-600">
                        {stats.totalRegistrations}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        {tryout.description ||
                          "Aucune description disponible pour ce tryout."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="players">
            <TryoutPlayers 
              tryoutId={tryout.id} 
              onStatsChange={() => loadPlayerStats(tryout.id)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* End Tryout Modal */}
      <EndTryoutModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onEndTryout={handleEndTryout}
        selectedPlayers={selectedPlayers}
        tryoutName={tryout.name}
      />
    </div>
  );
} 