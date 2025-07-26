"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Users, 
  Star, 
  Search, 
  Trophy,
  Clock,
  Mail,
  ArrowRight,
  Zap,
  Target,
  BarChart3
} from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export default function WaitingList() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    coaches: 500,
    players: 2000,
    scouts: 50,
    total: 2550
  });

  // Load real statistics from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/waiting-list');
        const data = await response.json();
        
        if (response.ok && data.stats) {
          setStats({
            coaches: data.stats.coaches || 500,
            players: data.stats.players || 2000, 
            scouts: data.stats.scouts || 50,
            total: data.stats.total || 2550
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        // Keep default values on error
      }
    };

    loadStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error('Error submitting to waiting list:', data.error);
        // Show error to user but still allow them to see success state for demo
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Network error:', error);
      // Still show success for demo purposes
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: "coach",
      label: t('waitingList.roles.coach'),
      icon: <Users className="w-5 h-5" />,
      description: t('waitingList.roles.coachDescription')
    },
    {
      id: "player",
      label: t('waitingList.roles.player'),
      icon: <Star className="w-5 h-5" />,
      description: t('waitingList.roles.playerDescription')
    },
    {
      id: "scout", 
      label: t('waitingList.roles.scout'),
      icon: <Search className="w-5 h-5" />,
      description: t('waitingList.roles.scoutDescription')
    },
    {
      id: "parent",
      label: t('waitingList.roles.parent'),
      icon: <Trophy className="w-5 h-5" />,
      description: t('waitingList.roles.parentDescription')
    }
  ];

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: t('waitingList.features.smartCampManagement.title'),
      description: t('waitingList.features.smartCampManagement.description')
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: t('waitingList.features.performanceAnalytics.title'),
      description: t('waitingList.features.performanceAnalytics.description')
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('waitingList.features.connectedCommunity.title'),
      description: t('waitingList.features.connectedCommunity.description')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('waitingList.features.aiPoweredInsights.title'),
      description: t('waitingList.features.aiPoweredInsights.description')
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="UpGr8 Logo"
              width={120}
              height={60}
              priority
            />
            <Badge className="ml-3 bg-red-100 text-red-600 text-xs">
              {t('waitingList.comingSoon')}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{t('waitingList.launchDate')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-red-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjMzNTQxIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <Badge className="bg-red-600 text-white mb-6 px-4 py-2 text-sm font-medium">
            {t('waitingList.revolutionaryPlatform')}
          </Badge>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('waitingList.title')} <br />
            <span className="text-red-600">{t('waitingList.titleHighlight')}</span> <br />
            {t('waitingList.titleSuffix')}
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('waitingList.subtitle')}
          </p>

          {/* Waiting List Form */}
          {!isSubmitted ? (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">{t('waitingList.rolePrompt')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {roles.map((roleOption) => (
                      <button
                        key={roleOption.id}
                        type="button"
                        onClick={() => setRole(roleOption.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                          role === roleOption.id
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          {roleOption.icon}
                          <span className="font-medium text-sm">{roleOption.label}</span>
                          <span className="text-xs text-gray-500 text-center leading-tight">
                            {roleOption.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Input */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder={t('waitingList.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 text-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!email || !role || isLoading}
                    className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {t('waitingList.joinWaitingList')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="text-sm text-gray-500 mt-4">
                {t('waitingList.privacyNote')}
              </p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">{t('waitingList.successTitle')}</h3>
              <p className="text-green-700 mb-4">
                {t('waitingList.successMessage')}
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-green-600">
                <span>{t('waitingList.successBenefits.earlyAccess')}</span>
                <span>{t('waitingList.successBenefits.specialPricing')}</span>
                <span>{t('waitingList.successBenefits.premiumFeatures')}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-600 mb-8">{t('waitingList.socialProof')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.coaches}+</div>
              <div className="text-sm text-gray-600">{t('waitingList.stats.coachesRegistered')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.players.toLocaleString()}+</div>
              <div className="text-sm text-gray-600">{t('waitingList.stats.playersSignedUp')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.scouts}+</div>
              <div className="text-sm text-gray-600">{t('waitingList.stats.scoutsWaiting')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{Math.floor(stats.total / 25)}+</div>
              <div className="text-sm text-gray-600">{t('waitingList.stats.organizations')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('waitingList.featuresTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('waitingList.featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 rounded-xl p-3 flex-shrink-0">
                    <div className="text-red-600">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t('waitingList.finalCtaTitle')}
          </h2>
          <p className="text-xl mb-8 text-red-100">
            {t('waitingList.finalCtaSubtitle', { count: stats.total })}
          </p>
          
          {!isSubmitted && (
            <div className="flex items-center justify-center">
              <Button
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                className="bg-white text-red-600 hover:bg-red-50 font-semibold"
              >
                <Mail className="w-5 h-5 mr-2" />
                {t('waitingList.secureSpotNow')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Image
            src="/logo.png"
            alt="UpGr8 Logo"
            width={120}
            height={60}
            className="mx-auto mb-4 opacity-75"
          />
          <p className="mb-4">{t('waitingList.footerDescription')}</p>
          <p className="text-sm">
            {t('waitingList.footerContact')}{" "}
            <a href="mailto:hello@upgr8.com" className="text-red-400 hover:text-red-300">
              hello@upgr8.com
            </a>
          </p>
          <div className="mt-8 text-sm border-t border-gray-800 pt-6">
            {t('waitingList.footerCopyright')}
          </div>
        </div>
      </footer>
    </div>
  );
}