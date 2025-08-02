"use client";

import { useState, useEffect } from "react";
import { X, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/player";
import { useTranslation } from '@/hooks/useTranslation';

interface AddPlayerToTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerId: string) => void;
  availablePlayers: Player[];
  error?: string | null;
}

export function AddPlayerToTeamModal({
  isOpen,
  onClose,
  onSubmit,
  availablePlayers,
  error,
}: AddPlayerToTeamModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedPlayerId("");
    }
  }, [isOpen]);

  const filteredPlayers = availablePlayers.filter((player) => {
    const fullName = `${player.first_name || ""} ${player.last_name || ""}`
      .trim()
      .toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      player.jersey_number?.toString().includes(searchQuery) ||
      player.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayerId) {
      onSubmit(selectedPlayerId);
    }
  };

  const getPositionBadge = (position: string | null | undefined) => {
    const positionColors: Record<string, string> = {
      "forward": "bg-red-100 text-red-800",
      "defense": "bg-blue-100 text-blue-800",
      "goalie": "bg-green-100 text-green-800",
    };
    
    const positionLabels: Record<string, string> = {
      "forward": t('players.forward'),
      "defense": t('players.defense'),
      "goalie": t('players.goalie'),
    };

    const pos = position || "";
    return (
      <Badge className={positionColors[pos] || "bg-gray-100 text-gray-800"}>
        {positionLabels[pos] || t('players.undefinedPosition')}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('players.addPlayerToTeam')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {availablePlayers.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('players.noAvailablePlayers')}
              </h3>
              <p className="text-gray-600">
                {t('players.allPlayersAlreadyInTeam')}
              </p>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder={t('players.searchPlayer')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Players List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredPlayers.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    {t('players.noResults')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPlayers.map((player) => {
                      const fullName = `${player.first_name || ""} ${
                        player.last_name || ""
                      }`.trim();
                      return (
                        <div
                          key={player.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedPlayerId === player.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedPlayerId(player.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  #{player.jersey_number || "?"}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {fullName || t('players.undefinedName')}
                                </h4>
                                {player.email && (
                                  <p className="text-sm text-gray-600">
                                    {player.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getPositionBadge(player.position)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPlayerId || availablePlayers.length === 0}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {t('players.addToTeam')}
          </Button>
        </div>
      </div>
    </div>
  );
} 