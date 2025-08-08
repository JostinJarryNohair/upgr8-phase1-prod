"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Team } from "@/types/team";
import { supabase } from "@/lib/supabase/client";
import { fromDatabaseFormat as fromTeamDatabaseFormat } from "@/lib/mappers/teamMapper";
import { handleSupabaseError, showErrorToast } from '@/lib/errorHandling';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CreateSeasonPage({ params }: PageProps) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const { id: teamId } = await params;
        
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Utilisateur non authentifié");
          return;
        }

        // Load team data
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("id", teamId)
          .eq("coach_id", user.id)
          .single();

        if (teamError) {
          const appError = handleSupabaseError(teamError);
          showErrorToast(appError);
          setError(`Erreur lors du chargement de l'équipe: ${appError.message}`);
          return;
        }

        const formattedTeam = fromTeamDatabaseFormat(teamData);
        setTeam(formattedTeam);

      } catch (error) {
        const appError = handleSupabaseError(error as Error);
        showErrorToast(appError);
        setError(`Erreur lors du chargement des données: ${appError.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement de l'équipe...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || "Équipe non trouvée"}</div>
          <Button onClick={() => router.push("/coach-dashboard/teams")}>
            Retour aux équipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/coach-dashboard/teams/${team.id}?tab=seasons`)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-3 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Créer une Saison Régulière
              </h1>
              <p className="text-gray-600 mt-1">
                pour l'équipe {team.name} ({team.level})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
              La création de saisons régulières n'est pas encore implémentée.
            </div>
            <div className="text-sm text-gray-500 mb-6">
              Pour l'instant, les saisons régulières sont créées automatiquement 
              lorsque vous terminez un tryout. Vous pouvez ensuite les gérer individuellement.
            </div>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/coach-dashboard/teams/${team.id}?tab=tryouts`)}
              >
                Gérer les Tryouts
              </Button>
              <Button
                onClick={() => router.push(`/coach-dashboard/teams/${team.id}?tab=seasons`)}
              >
                Retour aux Saisons
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}