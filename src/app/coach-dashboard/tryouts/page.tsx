"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tryout } from "@/types/tryout";
import { Team } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trophy, Search, Calendar, MapPin, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromTryoutDatabaseFormat } from "@/lib/mappers/tryoutMapper";
import { fromDatabaseFormat as fromTeamDatabaseFormat } from "@/lib/mappers/teamMapper";
import { handleSupabaseError, showErrorToast, setToastCallback } from '@/lib/errorHandling';
import { useToast } from '@/components/ui/toast';

interface TryoutWithTeam extends Tryout {
  team?: Team;
  playerCount?: number;
}

export default function TryoutsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [tryouts, setTryouts] = useState<TryoutWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Set up toast callback
  useEffect(() => {
    setToastCallback(addToast);
  }, [addToast]);

  // Load tryouts with team info
  useEffect(() => {
    const loadTryouts = async () => {
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

        // Load tryouts with team information
        const { data: tryoutsData, error: tryoutsError } = await supabase
          .from("tryouts")
          .select(`
            *,
            team:teams(*)
          `)
          .eq("coach_id", user.id)
          .order("created_at", { ascending: false });

        if (tryoutsError) {
          const appError = handleSupabaseError(tryoutsError);
          showErrorToast(appError);
          setError(`Erreur lors du chargement des tryouts: ${appError.message}`);
          return;
        }

        // Format tryouts with team data and get player counts
        const formattedTryouts = await Promise.all(
          (tryoutsData || []).map(async (tryoutData) => {
            const tryout = fromTryoutDatabaseFormat(tryoutData);
            const team = tryoutData.team ? fromTeamDatabaseFormat(tryoutData.team) : undefined;

            // Get player count for this tryout
            const { data: playersData } = await supabase
              .from("tryout_players")
              .select("id")
              .eq("tryout_id", tryout.id);

            return {
              ...tryout,
              team,
              playerCount: playersData?.length || 0,
            };
          })
        );

        setTryouts(formattedTryouts);
      } catch (error) {
        const appError = handleSupabaseError(error as Error);
        showErrorToast(appError);
        setError(`Erreur lors du chargement des données: ${appError.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadTryouts();
  }, [addToast]);

  // Filter tryouts
  const filteredTryouts = tryouts.filter(tryout => {
    const matchesSearch = 
      tryout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tryout.team?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tryout.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tryout.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "En cours";
      case "completed": return "Terminé";
      case "cancelled": return "Annulé";
      default: return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Chargement des tryouts...</div>
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
              <h1 className="text-3xl font-bold">Gestion des Tryouts</h1>
              <p className="text-gray-600 mt-2">
                Vue d&apos;ensemble de tous vos tryouts à travers les équipes.
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
                placeholder="Rechercher un tryout, une équipe ou un lieu..."
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
              <option value="active">En cours</option>
              <option value="completed">Terminés</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
        </div>

        {/* Tryouts List */}
        {filteredTryouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tryouts.length === 0 ? "Aucun tryout créé" : "Aucun tryout trouvé"}
            </h3>
            <p className="text-gray-600 mb-6">
              {tryouts.length === 0 
                ? "Les tryouts sont créés et gérés depuis la page de chaque équipe."
                : "Aucun tryout ne correspond à vos critères de recherche."
              }
            </p>
            {tryouts.length === 0 && (
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
          <div className="space-y-4">
            {filteredTryouts.map((tryout) => (
              <div
                key={tryout.id}
                onClick={() => router.push(`/coach-dashboard/tryouts/${tryout.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Tryout Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tryout.name}
                      </h3>
                      <Badge className={getStatusColor(tryout.status)}>
                        {getStatusLabel(tryout.status)}
                      </Badge>
                    </div>
                    
                    {tryout.team && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Users className="w-4 h-4" />
                        <span>{tryout.team.name} - {tryout.team.level}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {tryout.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(tryout.start_date)} - {formatDate(tryout.end_date)}</span>
                        </div>
                      )}
                      {tryout.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{tryout.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {tryout.playerCount || 0}
                      </div>
                      <div className="text-xs text-gray-600">Joueurs</div>
                    </div>
                    <div className="text-blue-600">
                      →
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