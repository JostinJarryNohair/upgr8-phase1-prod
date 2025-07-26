"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Team, TeamFormData } from "@/types/team";
import { AddTeamModal } from "@/components/teams/AddTeamModal";
import { useTranslation } from '@/hooks/useTranslation';

interface TeamsManagementProps {
  teams: Team[];
  onAddTeam: (team: TeamFormData) => void;
  onDeleteTeam: (id: string) => void;
}

export function TeamsManagement({
  teams,
  onAddTeam,
  onDeleteTeam,
}: TeamsManagementProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, team: Team) => {
    e.stopPropagation(); // Prevent triggering team click
    setTeamToDelete(team);
  };

  const handleConfirmDelete = () => {
    if (teamToDelete) {
      onDeleteTeam(teamToDelete.id);
      setTeamToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setTeamToDelete(null);
  };

  const handleTeamClick = (team: Team) => {
    router.push(`/coach-dashboard/teams/${team.id}`);
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.level.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('teams.title')}</h1>
          <p className="text-gray-600 mt-1">{t('teams.subtitle')}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('teams.addTeam')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t('teams.searchTeams')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {teams.length === 0 ? t('teams.noTeams') : t('teams.noResults')}
            </h3>
            <p className="text-gray-600 mb-4">
              {teams.length === 0 
                ? t('teams.createFirstTeam') 
                : t('teams.tryDifferentSearch')
              }
            </p>
            {teams.length === 0 && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('teams.createTeam')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card 
              key={team.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTeamClick(team)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, team)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('teams.level')}:</span>
                  <Badge className={getLevelBadgeColor(team.level)}>
                    {team.level}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('teams.created')}:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(team.createdAt)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    {t('teams.managePlayers')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Team Modal */}
      <AddTeamModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddTeam}
      />

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('teams.deleteTeam')}</h3>
            <p className="text-gray-600 mb-6">
              {t('teams.deleteConfirmation', { name: teamToDelete.name })}
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleCancelDelete}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 