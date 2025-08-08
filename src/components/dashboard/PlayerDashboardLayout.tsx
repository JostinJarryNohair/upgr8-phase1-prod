"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PlayerSidebar } from "./PlayerSidebar";
import { PlayerTopbar } from "./PlayerTopbar";

interface PlayerDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PlayerDashboardLayout({ 
  children, 
  className
}: PlayerDashboardLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50 flex", className)}>
      {/* Fixed Sidebar */}
      <PlayerSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Fixed Topbar */}
        <PlayerTopbar />

        {/* Page Content */}
        <main className="flex-1 pt-16 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}