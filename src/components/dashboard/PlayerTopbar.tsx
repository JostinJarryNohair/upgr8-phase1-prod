"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
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
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
}

interface PlayerTopbarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (isCollapsed: boolean) => void;
  className?: string;
}

export function PlayerTopbar({
  isCollapsed = false,
  setIsCollapsed,
  className,
}: PlayerTopbarProps) {
  const router = useRouter();
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch authenticated player data
  React.useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: playerData, error } = await supabase
          .from("player_users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching player:", error);
          setLoading(false);
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Generate initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-gray-200 bg-white",
        className
      )}
      style={{ marginLeft: isCollapsed ? '4rem' : '16rem' }}
    >
      <div className="flex h-16 items-center px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsCollapsed?.(!isCollapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
          <div className="w-full max-w-lg lg:max-w-xs">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 sm:text-sm sm:leading-6"
                placeholder="Rechercher des joueurs..."
                type="search"
              />
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center gap-x-4 lg:gap-x-6">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  {player?.profile_picture ? (
                    <AvatarImage src={player.profile_picture} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-red-100 text-red-700 text-xs font-medium">
                      {player ? getInitials(player.first_name, player.last_name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {!loading && player && (
                    <>
                      <p className="text-sm font-medium leading-none">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {player.email}
                      </p>
                    </>
                  )}
                  {loading && (
                    <p className="text-sm font-medium leading-none">
                      Chargement...
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/player-dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/help")}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Aide</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
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