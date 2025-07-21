"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Users, FileText, MessageSquare } from "lucide-react";

export default function ScoutDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Scout Portal</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-8">
            🚧 Coming Soon
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scout Portal
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover and evaluate top hockey talent with comprehensive player profiles, 
            performance data, and evaluation tools. This feature is currently in development.
          </p>

          {/* Features Preview */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Browse Verified Player Profiles</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Access comprehensive player profiles with verified stats and achievements.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">View Camp Performance Data</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Analyze player performance from camps and evaluation events.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Search className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Export Evaluations</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Generate detailed evaluation reports for your scouting needs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Connect with Players and Coaches</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Direct communication channels with players and their coaches.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <p className="text-gray-600">
              Interested in accessing the scout portal when it launches?
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/register">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Register as Scout
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 