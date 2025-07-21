"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Star, Calendar, BarChart3 } from "lucide-react";

export default function PlayersDashboard() {
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
            <span className="text-sm text-gray-600">Player Dashboard</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
            🚧 Coming Soon
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Player Dashboard
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build your dynamic hockey resume, track your progress, and get discovered by scouts. 
            This feature is currently in development and will be available soon.
          </p>

          {/* Features Preview */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Dynamic Hockey Resume</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Showcase your skills, achievements, and progress in a professional profile.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Track Stats & Progress</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Monitor your performance metrics and development over time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Join Camps & Events</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Register for camps and events to enhance your skills and exposure.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Get Discovered by Scouts</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Connect with scouts and coaches looking for talent like you.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <p className="text-gray-600">
              Want to be notified when this feature launches?
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Account
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