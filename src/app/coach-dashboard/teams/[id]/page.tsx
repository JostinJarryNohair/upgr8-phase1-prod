"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowLeft, Eye, Trophy, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Team } from "@/types/team";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat } from "@/lib/mappers/teamMapper";
import { TeamPlayers } from "@/components/teams/team/TeamPlayers";
import { useTranslation } from '@/hooks/useTranslation';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface TeamStats {
  totalPlayers: number;
  activePlayers: number;
  forwards: number;
  defensemen: number;
  goalies: number;
}

export default function TeamDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<TeamStats>({
    totalPlayers: 0,
    activePlayers: 0,
    forwards: 0,
    defensemen: 0,
    goalies: 0,
  });

  useEffect(() => {
    const loadTeamAndStats = async () => {
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

        // Load team data from database
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("id", id)
          .eq("coach_id", user.id)
          .single();

        if (teamError) {
          console.error("Error loading team:", teamError);
          return;
        }

        if (teamData) {
          const formattedTeam = fromDatabaseFormat(teamData);
          setTeam(formattedTeam);
        }

        // TODO: When player_teams table is created, replace this with proper team player stats
        // For now, show 0 players since the junction table doesn't exist yet
        setStats({
          totalPlayers: 0,
          activePlayers: 0,
          forwards: 0,
          defensemen: 0,
          goalies: 0,
        });
      } catch (error) {
        console.error("Error loading team:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamAndStats();
  }, [params, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('teams.loading')}</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('teams.teamNotFound')}</div>
      </div>
    );
  }

  const getLevelBadgeColor = (level: string) => {
    const levelColors: Record<string, string> = {
      "U7": "bg-blue-100 text-blue-800",
      "U9": "bg-green-100 text-green-800",
      "U11": "bg-yellow-100 text-yellow-800",
      "U13": "bg-purple-100 text-purple-800",
      "U15": "bg-indigo-100 text-indigo-800",
      "U18": "bg-pink-100 text-pink-800",
      "Junior": "bg-red-100 text-red-800",
      "Senior": "bg-gray-100 text-gray-800",
      "M13": "bg-orange-100 text-orange-800",
      "M15": "bg-teal-100 text-teal-800",
      "M18": "bg-cyan-100 text-cyan-800",
    };
    
    return levelColors[level] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
                    {team.name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-gray-600">
                      <Trophy className="w-4 h-4 mr-1" />
                      <span className="text-sm">{t('teams.team')}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {t('teams.created')}: {formatDate(team.createdAt)}
                      </span>
                    </div>
                    <Badge className={getLevelBadgeColor(team.level)}>
                      {team.level}
                    </Badge>
                  </div>
                </div>
              </div>
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
            <div className="text-sm text-gray-600">{t('teams.totalPlayers')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.activePlayers}
            </div>
            <div className="text-sm text-gray-600">{t('teams.activePlayers')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.forwards}
            </div>
            <div className="text-sm text-gray-600">{t('teams.forwards')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.defensemen}
            </div>
            <div className="text-sm text-gray-600">{t('teams.defensemen')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.goalies}
            </div>
            <div className="text-sm text-gray-600">{t('teams.goalies')}</div>
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
              <span>{t('teams.overview')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>{t('teams.players')} ({stats.totalPlayers})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Team Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('teams.teamInformation')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('teams.teamName')}
                      </label>
                      <p className="text-gray-900 mt-1">{team.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('teams.level')}
                      </label>
                      <div className="mt-1">
                        <Badge className={getLevelBadgeColor(team.level)}>
                          {team.level}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('teams.created')}
                      </label>
                      <p className="text-gray-900 mt-1">
                        {formatDate(team.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Team Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('teams.teamStatistics')}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {stats.totalPlayers}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t('teams.totalPlayers')}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.activePlayers}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t('teams.activePlayers')}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-red-600">
                          {stats.forwards}
                        </div>
                        <div className="text-xs text-gray-600">
                          {t('teams.forwards')}
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-600">
                          {stats.defensemen}
                        </div>
                        <div className="text-xs text-gray-600">
                          {t('teams.defensemen')}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-600">
                          {stats.goalies}
                        </div>
                        <div className="text-xs text-gray-600">
                          {t('teams.goalies')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="players">
            <TeamPlayers teamId={team.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
