"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, ArrowLeft, Eye, Settings, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegularSeason } from "@/types/regularSeason";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat } from "@/lib/mappers/regularSeasonMapper";
import EditRegularSeasonModal from "@/components/regular-season/EditRegularSeasonModal";
import DeleteRegularSeasonModal from "@/components/regular-season/DeleteRegularSeasonModal";
import { RegularSeasonPlayers } from "@/components/regular-season/RegularSeasonPlayers";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface RegularSeasonStats {
  totalPlayers: number;
  activePlayers: number;
  inactivePlayers: number;
  injuredPlayers: number;
  suspendedPlayers: number;
}

export default function RegularSeasonDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [regularSeason, setRegularSeason] = useState<RegularSeason | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<RegularSeasonStats>({
    totalPlayers: 0,
    activePlayers: 0,
    inactivePlayers: 0,
    injuredPlayers: 0,
    suspendedPlayers: 0,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Separate function to load player stats (can be called multiple times)
  const loadPlayerStats = async (seasonId: string) => {
    try {
      const { data: playersData, error: playersError } =
        await supabase
          .from("regular_season_players")
          .select(
            `
          *,
          player:players (
            id,
            first_name,
            last_name,
            email,
            position,
            is_active
          )
        `
          )
          .eq("regular_season_id", seasonId);

      if (playersError) {
        console.error("Error loading players:", playersError);
        return;
      }

      if (playersData) {
        const totalPlayers = playersData.length;
        const activePlayers = playersData.filter(p => p.status === "active").length;
        const inactivePlayers = playersData.filter(p => p.status === "inactive").length;
        const injuredPlayers = playersData.filter(p => p.status === "injured").length;
        const suspendedPlayers = playersData.filter(p => p.status === "suspended").length;

        setStats({
          totalPlayers,
          activePlayers,
          inactivePlayers,
          injuredPlayers,
          suspendedPlayers,
        });

        console.log(`🔄 Season stats updated: ${totalPlayers} total players`);
      }
    } catch (error) {
      console.error("Error loading player stats:", error);
    }
  };

  useEffect(() => {
    const loadSeasonAndStats = async () => {
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

        // Load regular season data from database
        const { data: seasonData, error: seasonError } = await supabase
          .from("regular_seasons")
          .select("*")
          .eq("id", id)
          .eq("coach_id", user.id)
          .single();

        if (seasonError) {
          console.error("Error loading regular season:", seasonError);
          return;
        }

        if (seasonData) {
          const formattedSeason = fromDatabaseFormat(seasonData);
          setRegularSeason(formattedSeason);
        }

        // Load initial player stats
        await loadPlayerStats(id);
        
      } catch (error) {
        console.error("Error loading regular season:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSeasonAndStats();
  }, [params]);

  // Handle tab change and reload stats when switching to overview
  const handleTabChange = async (newTab: string) => {
    setActiveTab(newTab);
    if (newTab === "overview" && regularSeason) {
      console.log("🔄 Reloading stats due to tab change to overview");
      await loadPlayerStats(regularSeason.id);
    }
  };

  const getStatusColor = () => {
    if (!regularSeason) return "bg-gray-100 text-gray-800";
    
    switch (regularSeason.status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    if (!regularSeason) return "Inconnu";
    
    switch (regularSeason.status) {
      case "active": return "Active";
      case "completed": return "Terminée";
      case "cancelled": return "Annulée";
      default: return regularSeason.status;
    }
  };

  const handleSeasonUpdated = (updatedSeason: RegularSeason) => {
    setRegularSeason(updatedSeason);
  };

  const handleSeasonDeleted = () => {
    router.push("/coach-dashboard/regular-season");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement de la saison régulière...</div>
      </div>
    );
  }

  if (!regularSeason) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Saison régulière non trouvée</div>
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
                    {regularSeason.name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    {regularSeason.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{regularSeason.location}</span>
                      </div>
                    )}
                    {(regularSeason.start_date || regularSeason.end_date) && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {regularSeason.start_date ? new Date(regularSeason.start_date).toLocaleDateString() : ""} 
                          {regularSeason.start_date && regularSeason.end_date ? " - " : ""}
                          {regularSeason.end_date ? new Date(regularSeason.end_date).toLocaleDateString() : ""}
                        </span>
                      </div>
                    )}
                    <Badge className={getStatusColor()}>
                      {getStatusText()}
                    </Badge>
                    {regularSeason.level && <Badge variant="outline">{regularSeason.level}</Badge>}
                  </div>
                </div>
              </div>
            </div>
            {/* Season Management Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Button
                onClick={() => setIsDeleteModalOpen(true)}
                variant="destructive"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-8 py-6 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalPlayers}
            </div>
            <div className="text-sm text-gray-600">Total Joueurs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.activePlayers}
            </div>
            <div className="text-sm text-gray-600">Actifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats.inactivePlayers}
            </div>
            <div className="text-sm text-gray-600">Inactifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.injuredPlayers}
            </div>
            <div className="text-sm text-gray-600">Blessés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.suspendedPlayers}
            </div>
            <div className="text-sm text-gray-600">Suspendus</div>
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
                Aperçu de la Saison Régulière
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails de la Saison
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom:</span>
                      <span className="font-medium">{regularSeason.name}</span>
                    </div>
                    {regularSeason.level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Niveau:</span>
                        <span className="font-medium">{regularSeason.level}</span>
                      </div>
                    )}
                    {regularSeason.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lieu:</span>
                        <span className="font-medium">{regularSeason.location}</span>
                      </div>
                    )}
                    {regularSeason.start_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date de début:</span>
                        <span className="font-medium">
                          {new Date(regularSeason.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {regularSeason.end_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date de fin:</span>
                        <span className="font-medium">
                          {new Date(regularSeason.end_date).toLocaleDateString()}
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
                      <span className="text-gray-600">Total Joueurs:</span>
                      <span className="font-medium">{stats.totalPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joueurs Actifs:</span>
                      <span className="font-medium text-green-600">
                        {stats.activePlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joueurs Inactifs:</span>
                      <span className="font-medium text-gray-600">
                        {stats.inactivePlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joueurs Blessés:</span>
                      <span className="font-medium text-orange-600">
                        {stats.injuredPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joueurs Suspendus:</span>
                      <span className="font-medium text-red-600">
                        {stats.suspendedPlayers}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        {regularSeason.description ||
                          "Aucune description disponible pour cette saison régulière."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="players">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <RegularSeasonPlayers seasonId={regularSeason.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <EditRegularSeasonModal
        regularSeason={regularSeason}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSeasonUpdated={handleSeasonUpdated}
      />
      
      <DeleteRegularSeasonModal
        regularSeason={regularSeason}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSeasonDeleted={handleSeasonDeleted}
      />
    </div>
  );
} 