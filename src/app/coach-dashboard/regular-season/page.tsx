"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tryout, TryoutFormData } from "@/types/tryout";
import { RegularSeason } from "@/types/regularSeason";
import { TryoutManagement } from "@/components/regular-season/TryoutManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat, toDatabaseFormat } from "@/lib/mappers/tryoutMapper";
import { fromDatabaseFormat as fromRegularSeasonDatabaseFormat } from "@/lib/mappers/regularSeasonMapper";
import { useTranslation } from '@/hooks/useTranslation';

export default function RegularSeasonPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [regularSeasons, setRegularSeasons] = useState<RegularSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tryouts");

  // Load tryouts and regular seasons from database
  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error(t('common.notAuthenticated'));
        setLoading(false);
        return;
      }

      // Load tryouts
      const { data: tryoutData, error: tryoutError } = await supabase
        .from("tryouts")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (tryoutError) {
        console.error('Error loading tryouts:', tryoutError);
      } else {
        const formattedTryouts = (tryoutData || []).map(fromDatabaseFormat);
        setTryouts(formattedTryouts);
      }

      // Load regular seasons
      const { data: seasonData, error: seasonError } = await supabase
        .from("regular_seasons")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (seasonError) {
        console.error('Error loading regular seasons:', seasonError);
      } else {
        const formattedSeasons = (seasonData || []).map(fromRegularSeasonDatabaseFormat);
        setRegularSeasons(formattedSeasons);
      }

      setLoading(false);
    };

    loadData();
  }, [t]);

  const handleAddTryout = async (newTryout: TryoutFormData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error(t('common.notAuthenticated'));
      return;
    }

    const { data, error } = await supabase
      .from("tryouts")
      .insert([
        {
          ...toDatabaseFormat(newTryout),
          coach_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding tryout:', error);
      return;
    }

    if (data) {
      // Convert raw DB data to frontend format
      const formattedTryout = fromDatabaseFormat(data);
      setTryouts([formattedTryout, ...tryouts]);
    }
  };

  const handleUpdateTryout = async (
    id: string,
    updates: Partial<TryoutFormData>
  ) => {
    const { data, error } = await supabase
      .from("tryouts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tryout:', error);
      return;
    }

    if (data) {
      // Convert DB format to frontend format
      const formattedTryout = fromDatabaseFormat(data);
      setTryouts(tryouts.map((tryout) => (tryout.id === id ? formattedTryout : tryout)));
    }
  };

  const handleDeleteTryout = async (id: string) => {
    const { error } = await supabase.from("tryouts").delete().eq("id", id);

    if (error) {
      console.error('Error deleting tryout:', error);
      return;
    }

    setTryouts(tryouts.filter((tryout) => tryout.id !== id));
  };

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
      case "active": return "Active";
      case "completed": return "Terminée";
      case "cancelled": return "Annulée";
      default: return status;
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold">Tryouts & Saisons Régulières</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos tryouts et les saisons régulières créées à partir des sélections.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger
              value="tryouts"
              className="flex items-center space-x-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Tryouts ({tryouts.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="regular-seasons"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Saisons Régulières ({regularSeasons.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tryouts">
            <TryoutManagement
              tryouts={tryouts}
              onAddTryout={handleAddTryout}
              onUpdateTryout={handleUpdateTryout}
              onDeleteTryout={handleDeleteTryout}
            />
          </TabsContent>

          <TabsContent value="regular-seasons">
            {regularSeasons.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune saison régulière
                </h3>
                <p className="text-gray-600 mb-4">
                  Terminez un tryout pour créer votre première saison régulière.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularSeasons.map((season) => (
                  <div 
                    key={season.id} 
                    onClick={() => router.push(`/coach-dashboard/regular-season/season/${season.id}`)}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {season.name}
                      </h3>
                      <Badge className={getStatusColor(season.status)}>
                        {getStatusLabel(season.status)}
                      </Badge>
                    </div>

                    {season.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {season.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-gray-600">
                      {season.level && (
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 mr-2" />
                          <span>{season.level}</span>
                        </div>
                      )}
                      
                      {season.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{season.location}</span>
                        </div>
                      )}

                      {(season.start_date || season.end_date) && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {season.start_date ? new Date(season.start_date).toLocaleDateString() : ""} 
                            {season.start_date && season.end_date ? " - " : ""}
                            {season.end_date ? new Date(season.end_date).toLocaleDateString() : ""}
                          </span>
                        </div>
                      )}
                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Créée le {new Date(season.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      Cliquer pour voir →
                    </div>
                  </div>
                </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 