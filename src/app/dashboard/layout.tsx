"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

/**
 * Dashboard Layout
 *
 * Wraps all pages under the /dashboard route with the DashboardLayout component.
 * Provides consistent sidebar, topbar, and content structure with loading screen.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
