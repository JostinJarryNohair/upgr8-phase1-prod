"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { 
  Settings, 
  HelpCircle,
  Dumbbell,
  Users,
  User,
  ClipboardCheck,
  Users2,
  Calendar,
  Trophy,
  LucideIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from '@/hooks/useTranslation';

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  coaching_level: string;
}

export type ViewType =
  | "teams"
  | "players"
  | "training"
  | "evaluations"
  | "staff"
  | "camps"
  | "tryouts"
  | "seasons";

interface NavItem {
  id: ViewType;
  label: string;
  icon: LucideIcon;
  href: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  className?: string;
}

export function Sidebar({ isCollapsed, className }: SidebarProps) {
  const pathname = usePathname();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Fetch authenticated coach data
  useEffect(() => {
    const fetchCoach = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data: coachData, error } = await supabase
          .from("coaches")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching coach:", error);
          return;
        }

        setCoach(coachData);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, []);

  const navItems: NavItem[] = [
    { id: "camps", label: t('navigation.camps'), icon: Dumbbell, href: "/coach-dashboard/camps" },
    { id: "teams", label: t('navigation.teams'), icon: Users, href: "/coach-dashboard/teams" },
    { id: "tryouts", label: t('navigation.tryouts'), icon: Trophy, href: "/coach-dashboard/tryouts" },
    { id: "seasons", label: t('navigation.seasons'), icon: Calendar, href: "/coach-dashboard/seasons" },
    { id: "players", label: t('navigation.players'), icon: User, href: "/coach-dashboard/players" },
    { id: "evaluations", label: t('navigation.evaluations'), icon: ClipboardCheck, href: "/coach-dashboard/evaluations" },
    { id: "staff", label: t('navigation.staff'), icon: Users2, href: "/coach-dashboard/staff" },
  ];

  const settingsItems = [
    {
      name: t('navigation.settings'),
      href: "/coach-dashboard/settings",
      icon: Settings,
    },
    {
      name: t('navigation.help'),
      href: "/help",
      icon: HelpCircle,
    },
  ];

  // Generate initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "coach":
        return "Coach";
      case "directeur-general":
        return "Directeur Général";
      case "directeur-hockey":
        return "Directeur Hockey";
      default:
        return "Coach";
    }
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 shadow-xl transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-6 border-b border-gray-700 bg-gray-800">
        {!isCollapsed && (
          <div className="bg-white px-4 py-2 rounded-lg">
            <Image
              src="/logo.png"
              alt="UpGr8"
              width={140}
              height={48}
              className="w-auto h-8"
            />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-700/50 relative",
                    isActive
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn("w-5 h-5", isCollapsed ? "mx-auto" : "mr-3")}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                  {isCollapsed && (
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings Navigation */}
      <nav className="px-3 py-4 border-t border-gray-700">
        <ul className="space-y-2">
          {settingsItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-700/50 relative",
                    isActive
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn("w-5 h-5", isCollapsed ? "mx-auto" : "mr-3")}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                  {isCollapsed && (
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity z-50">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center px-3 py-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs font-bold text-white">
                {loading
                  ? "..."
                  : coach
                  ? getInitials(coach.first_name, coach.last_name)
                  : "??"}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {loading
                  ? "Chargement..."
                  : coach
                  ? `${coach.first_name} ${coach.last_name}`
                  : "Coach"}
              </p>
              <p className="text-xs text-gray-400">
                {loading ? "..." : coach ? getRoleDisplay(coach.role) : "Coach"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
