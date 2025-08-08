"use client";

import * as React from "react";
import { PlayerDashboardLayout } from "@/components/dashboard/PlayerDashboardLayout";

/**
 * Player Dashboard Layout
 *
 * Wraps all pages under the /player-dashboard route with the PlayerDashboardLayout component.
 * Provides consistent sidebar, topbar, and content structure for players.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PlayerDashboardLayout>{children}</PlayerDashboardLayout>;
}