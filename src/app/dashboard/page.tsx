"use client";

import { useEffect, useState } from "react";
import { supabase, Coach } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Get coach profile
      const { data: coachData, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setCoach(coachData);
    } catch (error) {
      console.error("Error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dashboard UPGR8</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>

          {coach && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">
                Bienvenue, {coach.first_name}!
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Nom:</strong> {coach.first_name} {coach.last_name}
                </div>
                <div>
                  <strong>Email:</strong> {coach.email}
                </div>
                <div>
                  <strong>Rôle:</strong> {coach.role}
                </div>
                <div>
                  <strong>Niveau:</strong> {coach.coaching_level}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Prochaines étapes:</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✅ Authentification configurée</li>
              <li>
                ⏳ Gestion des camps d&apos;entraînement (prochaine étape)
              </li>
              <li>⏳ Ajout des joueurs</li>
              <li>⏳ Système d&apos;évaluation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
