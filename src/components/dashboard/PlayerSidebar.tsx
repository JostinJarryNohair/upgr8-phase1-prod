"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { 
  Settings, 
  HelpCircle,
  Home,
  Users,
  Trophy,
  Calendar,
  LucideIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
}

export type PlayerViewType =
  | "feed"
  | "players" 
  | "achievements"
  | "events";

interface NavItem {
  id: PlayerViewType;
  label: string;
  icon: LucideIcon;
  href: string;
}

interface PlayerSidebarProps {
  isCollapsed?: boolean;
  className?: string;
}

export function PlayerSidebar({ isCollapsed = false, className }: PlayerSidebarProps) {
  const pathname = usePathname();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch authenticated player data
  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data: playerData, error } = await supabase
          .from("player_users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching player:", error);
          return;
        }

        setPlayer(playerData);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, []);

  const navItems: NavItem[] = [
    { id: "feed", label: "Fil d'actualité", icon: Home, href: "/player-dashboard" },
    { id: "players", label: "Joueurs", icon: Users, href: "/player-dashboard/players" },
    { id: "achievements", label: "Réalisations", icon: Trophy, href: "/player-dashboard/achievements" },
    { id: "events", label: "Événements", icon: Calendar, href: "/player-dashboard/events" },
  ];

  const settingsItems = [
    {
      name: "Paramètres",
      href: "/player-dashboard/settings",
      icon: Settings,
    },
    {
      name: "Aide",
      href: "/help",
      icon: HelpCircle,
    },
  ];

  // Generate initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="UpGr8 Logo"
              width={32}
              height={32}
              className="rounded"
            />
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  UpGr8 Hockey
                </h1>
                <p className="text-xs text-gray-500">Joueur</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-50 text-red-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Settings Section */}
        <div className="border-t border-gray-200 p-3">
          <div className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        {!loading && player && !isCollapsed && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-red-100 text-red-700 text-xs font-medium">
                  {getInitials(player.first_name, player.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {player.first_name} {player.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{player.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}