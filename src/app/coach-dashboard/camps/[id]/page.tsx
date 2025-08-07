"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, ArrowLeft, Eye, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camp } from "@/types/camp";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat } from "@/lib/mappers/campMapper";
import { CampPlayers } from "@/components/camps/camp/CampPlayer";
import { CampEvaluations } from "@/components/camps/camp/CampEvaluations";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CampStats {
  totalPlayers: number;
  activePlayers: number;
  pendingPlayers: number;
  totalRegistrations: number;
  totalEvaluations: number;
}

export default function CampDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<CampStats>({
    totalPlayers: 0,
    activePlayers: 0,
    pendingPlayers: 0,
    totalRegistrations: 0,
    totalEvaluations: 0,
  });

  const loadCampAndStats = useCallback(async () => {
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

      // Load camp data from database
      const { data: campData, error: campError } = await supabase
        .from("camps")
        .select("*")
        .eq("id", id)
        .eq("coach_id", user.id)
        .single();

      if (campError) {
        console.error("Error loading camp:", campError);
        return;
      }

      if (campData) {
        const formattedCamp = fromDatabaseFormat(campData);
        setCamp(formattedCamp);
      }

      // Load player stats for this camp
      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("camp_registrations")
          .select(
            `
          *,
          players (
            id,
            first_name,
            last_name,
            email,
            is_active
          )
        `
          )
          .eq("camp_id", id);

      if (registrationsError) {
        console.error("Error loading registrations:", registrationsError);
        return;
      }

      // Calculate stats
      if (registrationsData) {
        const totalRegistrations = registrationsData.length;
        const activePlayers = registrationsData.filter(
          (reg) => reg.status === "confirmed"
        ).length;
        const pendingPlayers = registrationsData.filter(
          (reg) => reg.status === "pending"
        ).length;
        const totalPlayers = registrationsData.filter(
          (reg) => reg.status !== "cancelled"
        ).length;

        // Get evaluations count for camp players
        const playerIds = registrationsData
          .filter(reg => reg.players && reg.status !== "cancelled")
          .map(reg => reg.players.id);

        let totalEvaluations = 0;
        if (playerIds.length > 0) {
          const { data: evaluationsData } = await supabase
            .from("player_evaluations")
            .select("id")
            .in("player_id", playerIds);
          totalEvaluations = evaluationsData?.length || 0;
        }

        setStats({
          totalPlayers,
          activePlayers,
          pendingPlayers,
          totalRegistrations,
          totalEvaluations,
        });
      }
    } catch (error) {
      console.error("Error loading camp:", error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadCampAndStats();
  }, [params, loadCampAndStats]);

  const getStatusColor = () => {
    if (!camp?.isActive) return "bg-gray-100 text-gray-800";
    const now = new Date();
    const start = new Date(camp.startDate);
    const end = new Date(camp.endDate);

    if (now < start) return "bg-blue-100 text-blue-800";
    if (now > end) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusText = () => {
    if (!camp?.isActive) return "Archived";
    const now = new Date();
    const start = new Date(camp.startDate);
    const end = new Date(camp.endDate);

    if (now < start) return "Upcoming";
    if (now > end) return "Completed";
    return "Active";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading camp...</div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Camp not found</div>
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
                    {camp.name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{camp.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {new Date(camp.startDate).toLocaleDateString()} -{" "}
                        {new Date(camp.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge className={getStatusColor()}>
                      {getStatusText()}
                    </Badge>
                    <Badge variant="outline">{camp.level}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Now with Real Data */}
      <div className="px-8 py-6 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalPlayers}
            </div>
            <div className="text-sm text-gray-600">Total Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.activePlayers}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingPlayers}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalRegistrations}
            </div>
            <div className="text-sm text-gray-600">Total Registrations</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-8 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Players ({stats.totalPlayers})</span>
            </TabsTrigger>
            <TabsTrigger
              value="evaluations"
              className="flex items-center space-x-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Evaluations ({stats.totalEvaluations})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Camp Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Camp Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{camp.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">{camp.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{camp.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">
                        {new Date(camp.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">
                        {new Date(camp.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor()}>
                        {getStatusText()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Registration Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Players:</span>
                      <span className="font-medium">{stats.totalPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmed:</span>
                      <span className="font-medium text-green-600">
                        {stats.activePlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium text-orange-600">
                        {stats.pendingPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Registrations:
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
                        {camp.description ||
                          "No description available for this camp."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="players">
            <CampPlayers campId={camp.id} campName={camp.name} />
          </TabsContent>

          <TabsContent value="evaluations">
            <CampEvaluations campId={camp.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
