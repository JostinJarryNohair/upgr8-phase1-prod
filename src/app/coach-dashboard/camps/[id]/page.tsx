"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, ArrowLeft, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camp } from "@/types/camp";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat } from "@/lib/mappers/campMapper";
import { CampPlayers } from "@/components/camps/camp/CampPlayer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadCamp = async () => {
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
        const { data, error } = await supabase
          .from("camps")
          .select("*")
          .eq("id", id)
          .eq("coach_id", user.id)
          .single();

        if (error) {
          console.error("Error loading camp:", error);
          return;
        }

        if (data) {
          const formattedCamp = fromDatabaseFormat(data);
          setCamp(formattedCamp);
        }
      } catch (error) {
        console.error("Error loading camp:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCamp();
  }, [params]);

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

      {/* Quick Stats */}
      <div className="px-8 py-6 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Registrations</div>
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
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
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
              <span>Players</span>
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
                    Description
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      {camp.description ||
                        "No description available for this camp."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="players">
            <CampPlayers campId={camp.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
