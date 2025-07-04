"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LayoutDashboard, Settings, HelpCircle } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  className?: string;
}

export function Sidebar({ isCollapsed, className }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Tableau de bord",
      href: "/dashboard/coach",
      icon: LayoutDashboard,
    },
    {
      name: "Paramètres",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      name: "Aide",
      href: "/help",
      icon: HelpCircle,
    },
  ];

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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
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
              <span className="text-xs font-bold text-white">CM</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Coach Martin</p>
              <p className="text-xs text-gray-400">Les Titans</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
