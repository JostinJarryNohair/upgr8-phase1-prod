"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  Users,
  Plus,
  Filter,
  FileText
} from "lucide-react";
import { GamePlanModal } from "./GamePlanModal";

// Mock data types
interface ScheduleEvent {
  id: string;
  type: "match" | "practice" | "tournament";
  title: string;
  date: string;
  time: string;
  location: string;
  opponent?: string;
  status: "upcoming" | "completed" | "cancelled";
  result?: string;
}

interface RegularSeasonScheduleProps {
  seasonId: string;
}

// Mock schedule data
const mockScheduleData: ScheduleEvent[] = [
  {
    id: "1",
    type: "match",
    title: "Match vs Lions de Montréal",
    date: "2025-08-15",
    time: "19:00",
    location: "Arena Municipal",
    opponent: "Lions de Montréal",
    status: "upcoming"
  },
  {
    id: "2",
    type: "practice",
    title: "Entraînement - Technique de tir",
    date: "2025-08-12",
    time: "18:30",
    location: "Centre d'entraînement",
    status: "upcoming"
  },
  {
    id: "3",
    type: "match",
    title: "Match vs Aigles de Québec",
    date: "2025-08-08",
    time: "20:00",
    location: "Arena Colisée",
    opponent: "Aigles de Québec",
    status: "completed",
    result: "3-2 (Victoire)"
  },
  {
    id: "4",
    type: "tournament",
    title: "Tournoi d'Été 2025",
    date: "2025-08-22",
    time: "09:00",
    location: "Complexe Sportif Central",
    status: "upcoming"
  },
  {
    id: "5",
    type: "practice",
    title: "Entraînement - Préparation physique",
    date: "2025-08-10",
    time: "18:00",
    location: "Centre d'entraînement",
    status: "completed"
  },
  {
    id: "6",
    type: "match",
    title: "Match vs Ours de Gatineau",
    date: "2025-08-18",
    time: "19:30",
    location: "Arena Municipal",
    opponent: "Ours de Gatineau",
    status: "upcoming"
  },
  {
    id: "7",
    type: "practice",
    title: "Entraînement - Stratégies défensives",
    date: "2025-08-14",
    time: "18:30",
    location: "Centre d'entraînement",
    status: "upcoming"
  },
  {
    id: "8",
    type: "match",
    title: "Match vs Requins de Sherbrooke",
    date: "2025-08-25",
    time: "18:00",
    location: "Arena Olympique",
    opponent: "Requins de Sherbrooke",
    status: "upcoming"
  }
];

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "match": return "bg-blue-100 text-blue-800";
    case "practice": return "bg-green-100 text-green-800";
    case "tournament": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case "match": return Trophy;
    case "practice": return Users;
    case "tournament": return Calendar;
    default: return Calendar;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "upcoming": return "bg-yellow-100 text-yellow-800";
    case "completed": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "upcoming": return "À venir";
    case "completed": return "Terminé";
    case "cancelled": return "Annulé";
    default: return status;
  }
};

export function RegularSeasonSchedule({ seasonId }: RegularSeasonScheduleProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>(mockScheduleData);
  const [filter, setFilter] = useState<"all" | "match" | "practice" | "tournament">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [isGamePlanModalOpen, setIsGamePlanModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<ScheduleEvent | null>(null);

  // Filter events
  const filteredEvents = events
    .filter(event => filter === "all" || event.type === filter)
    .filter(event => statusFilter === "all" || event.status === statusFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return today.toDateString() === eventDate.toDateString();
  };

  const isUpcoming = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return eventDate > today;
  };

  const openGamePlan = (event: ScheduleEvent) => {
    setSelectedMatch(event);
    setIsGamePlanModalOpen(true);
  };

  const closeGamePlan = () => {
    setIsGamePlanModalOpen(false);
    setSelectedMatch(null);
  };

  const handleSaveGamePlan = (gamePlan: any) => {
    console.log("Game plan saved:", gamePlan);
    // In a real app, this would save to the database
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Horaire de la Saison
          </h2>
          <p className="text-sm text-gray-600">
            Calendrier des matchs, entraînements et tournois
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un Événement
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtres:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Type:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="match">Matchs</option>
              <option value="practice">Entraînements</option>
              <option value="tournament">Tournois</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Statut:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="upcoming">À venir</option>
              <option value="completed">Terminés</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun événement trouvé
          </h3>
          <p className="text-gray-600">
            Aucun événement ne correspond à vos critères de recherche.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const EventIcon = getEventTypeIcon(event.type);
            
            return (
              <Card 
                key={event.id} 
                className={`hover:shadow-md transition-shadow ${
                  isToday(event.date) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getEventTypeColor(event.type)}`}>
                        <EventIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <Badge className={getStatusColor(event.status)}>
                            {getStatusText(event.status)}
                          </Badge>
                          {isToday(event.date) && (
                            <Badge className="bg-orange-100 text-orange-800">
                              Aujourd'hui
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span className={isToday(event.date) ? 'font-semibold text-orange-600' : ''}>
                                {formatDate(event.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                          
                          {event.opponent && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Trophy className="w-4 h-4" />
                              <span>vs {event.opponent}</span>
                            </div>
                          )}
                          
                          {event.result && (
                            <div className="mt-2">
                              <Badge className="bg-blue-100 text-blue-800">
                                {event.result}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {event.type === "match" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openGamePlan(event)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          Plan de Match
                        </Button>
                      )}
                      {event.status === "upcoming" && isUpcoming(event.date) && (
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Statistiques de l'Horaire
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.type === "match").length}
            </div>
            <div className="text-sm text-gray-600">Matchs Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.type === "practice").length}
            </div>
            <div className="text-sm text-gray-600">Entraînements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {events.filter(e => e.type === "tournament").length}
            </div>
            <div className="text-sm text-gray-600">Tournois</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {events.filter(e => e.status === "upcoming").length}
            </div>
            <div className="text-sm text-gray-600">À Venir</div>
          </div>
        </div>
      </div>

      {/* Game Plan Modal */}
      {selectedMatch && (
        <GamePlanModal
          isOpen={isGamePlanModalOpen}
          onClose={closeGamePlan}
          matchTitle={selectedMatch.title}
          opponent={selectedMatch.opponent || "Adversaire"}
          date={formatDate(selectedMatch.date)}
          time={selectedMatch.time}
          onSave={handleSaveGamePlan}
        />
      )}
    </div>
  );
}