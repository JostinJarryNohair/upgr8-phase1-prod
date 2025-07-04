"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  className?: string;
}

export function Topbar({
  isCollapsed,
  setIsCollapsed,
  className,
}: TopbarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem("userType");
    localStorage.removeItem("userData");

    // Navigate to login page
    router.push("/");
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      title: "Nouvelle évaluation terminée",
      message: "Alexandre Tremblay a terminé son évaluation de tir",
      time: "Il y a 2 minutes",
      read: false,
      type: "evaluation",
    },
    {
      id: 2,
      title: "Rappel d&apos;entraînement",
      message:
        "N&apos;oubliez pas : L&apos;entraînement technique commence dans 30 minutes",
      time: "Il y a 28 minutes",
      read: false,
      type: "reminder",
    },
    {
      id: 3,
      title: "Nouveau joueur inscrit",
      message: "Emma Gagnon a été ajoutée à l&apos;équipe Titans U15 AAA",
      time: "Il y a 1 heure",
      read: true,
      type: "registration",
    },
    {
      id: 4,
      title: "Objectif atteint",
      message: "Félicitations ! Vous avez complété 100 évaluations ce mois-ci",
      time: "Il y a 2 heures",
      read: true,
      type: "achievement",
    },
    {
      id: 5,
      title: "Mise à jour de l&apos;horaire",
      message: "Session d&apos;entraînement déplacée à 19h00 - Aréna 2",
      time: "Il y a 1 jour",
      read: true,
      type: "schedule",
    },
  ];

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm transition-all duration-300",
        isCollapsed ? "left-16" : "left-64",
        className
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher joueurs, équipes, évaluations..."
              className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white focus:border-red-300 focus:ring-red-200"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white hover:bg-red-500 flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="border-b border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">
                    {unreadCount} nouvelles notifications
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <Button variant="ghost" className="w-full text-sm">
                    Voir toutes les notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src="/avatar.jpg" alt="Coach Martin" />
                  <AvatarFallback className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm">
                    CM
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    Entraîneur Martin
                  </p>
                  <p className="text-xs text-gray-500">
                    entraineur.martin@upgr8.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Aide & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
