"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CheckCircle, Users, Star, Search } from "lucide-react";

// Original landing page - saved for post-launch use
export default function OriginalLandingPage() {
  const [activeTab, setActiveTab] = useState("coaches");

  const tabs = [
    {
      id: "coaches",
      label: "Coaches",
      icon: <Users className="w-5 h-5" />,
      color: "red",
      content: {
        title: "Coach Dashboard",
        subtitle: "Simplify camp management and track player development.",
        features: [
          "Create & Manage Camps",
          "Evaluate Player Performance",
          "Access Smart Practice Generator",
          "Season & Weekly Planning Tools",
        ],
        buttonText: "Enter Coach Dashboard",
        buttonLink: "/coach-dashboard",
      },
    },
    {
      id: "players",
      label: "Players",
      icon: <Star className="w-5 h-5" />,
      color: "red",
      content: {
        title: "Player Profile",
        subtitle: "Showcase your skills and grow as an athlete.",
        features: [
          "Build Your Dynamic Hockey Resume",
          "Track Stats & Progress",
          "Join Camps & Events",
          "Get Discovered by Scouts",
        ],
        buttonText: "View Player Space",
        buttonLink: "/players-dashboard",
      },
    },
    {
      id: "scouts",
      label: "Scouts",
      icon: <Search className="w-5 h-5" />,
      color: "red",
      content: {
        title: "Scout Access",
        subtitle: "Discover and evaluate top hockey talent.",
        features: [
          "Browse Verified Player Profiles",
          "View Camp Performance Data",
          "Export Evaluations",
          "Connect with Players and Coaches",
        ],
        buttonText: "Enter Scout Portal",
        buttonLink: "/scout-dashboard",
      },
    },
  ];

  const active = tabs.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="UpGr8 Logo"
              width={120}
              height={60}
              priority
            />
          </Link>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-gray-100 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge className="bg-red-100 text-red-600 mb-4">
            All-in-One Hockey Development
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Elevate Your <span className="text-red-600">Hockey Experience</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            From managing camps to building elite profiles — UpGr8 connects
            coaches, players, and scouts in one seamless platform.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Get Started
              </Button>
            </Link>
            <Link href="#tabs">
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section id="tabs" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Who Are You?</h2>
          <p className="text-lg text-gray-600 mb-12">
            Choose your role to see how UpGr8 can help you thrive.
          </p>
          <div className="flex justify-center gap-4 flex-wrap mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-600 text-white`
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {active && (
            <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-2xl border shadow-md text-left">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                {active.content.title}
              </h3>
              <p className="text-gray-600 mb-6">{active.content.subtitle}</p>
              <ul className="space-y-3 mb-6">
                {active.content.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-red-500 mt-1" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link href={active.content.buttonLink}>
                <Button
                  className={`bg-${active.color}-600 hover:bg-${active.color}-700 text-white`}
                >
                  {active.content.buttonText}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-red-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join the UpGr8 Community?
          </h2>
          <p className="text-lg mb-6">
            Connect with your team, grow your profile, and unlock your full
            potential — all in one place.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-red-100"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-red-700"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">UpGr8</h3>
            <p>The complete platform for modern hockey development.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#tabs" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Integrations
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Status
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-sm border-t border-gray-800 pt-6">
          &copy; 2024 UpGr8. All rights reserved.
        </div>
      </footer>
    </div>
  );
}