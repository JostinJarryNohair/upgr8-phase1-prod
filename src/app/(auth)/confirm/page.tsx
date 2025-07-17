// src/app/(auth)/confirm/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // 1. Process the token from URL hash fragment
    const processToken = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get("access_token");
      const type = params.get("type");
      const error = params.get("error");

      if (error) {
        handleError(error, params.get("error_description") || undefined);
        return;
      }

      if (!token || type !== "signup") {
        setStatus("error");
        setMessage("Lien de confirmation invalide ou expiré.");
        return;
      }

      // 2. Verify the token directly
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "signup",
      });

      if (verifyError) {
        handleError(verifyError.message);
      }
    };

    // 3. Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setEmail(session.user.email || "");
        await verifyCoachProfile(session.user.id);
      }
    });

    // Initial processing
    processToken();

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (status === "loading") {
        setStatus("error");
        setMessage(
          "La confirmation a pris trop de temps. Veuillez rafraîchir la page."
        );
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const verifyCoachProfile = async (userId: string) => {
    try {
      const { data: coach, error } = await supabase
        .from("coaches")
        .select("first_name")
        .eq("id", userId)
        .single();

      if (error || !coach) {
        throw new Error(error?.message || "Profil coach non trouvé");
      }

      setStatus("success");
      setMessage(`Bienvenue ${coach.first_name}!`);
      setTimeout(() => router.push("/coach-dashboard"), 3000);
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Erreur de profil");
    }
  };

  const handleError = (error: string, description?: string) => {
    console.error("Confirmation error:", error);
    setStatus("error");

    const errorMessages: Record<string, string> = {
      expired_token: "Le lien a expiré. Veuillez demander un nouveau lien.",
      invalid_token: "Lien de confirmation invalide.",
      email_already_confirmed: "Votre email est déjà confirmé.",
    };

    setMessage(description || errorMessages[error] || `Erreur: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="UpGr8 Logo"
            width={120}
            height={60}
            className="mx-auto"
            priority
          />
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Confirmation en cours...
            </h1>
            <p className="text-gray-600">
              Nous validons votre adresse email. Un moment, s&apos;il vous
              plaît.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-green-900">
              Compte confirmé!
            </h1>
            <p className="text-gray-600">{message}</p>
            {email && (
              <p className="text-sm text-gray-500">
                Connecté en tant que: {email}
              </p>
            )}
            <div className="pt-4">
              <Button
                onClick={() => router.push("/coach-dashboard")}
                className="w-full"
              >
                Accéder au tableau de bord
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-red-900">
              Erreur de confirmation
            </h1>
            <p className="text-gray-600">{message}</p>

            <div className="space-y-3 pt-4">
              <Link href="/register">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Recréer un compte
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Se connecter
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="ghost" className="w-full text-blue-600">
                  Contacter le support
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
