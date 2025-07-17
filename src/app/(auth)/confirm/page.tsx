// src/app/(auth)/confirm/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        console.log("Confirmation attempt:", {
          token: token?.substring(0, 10) + "...",
          type,
        });

        // Supabase automatically processes the confirmation when the page loads
        // We just need to check the session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Confirmation error:", error);
          setStatus("error");

          if (error.message.includes("expired")) {
            setMessage(
              "Le lien de confirmation a expiré. Veuillez vous inscrire à nouveau."
            );
          } else if (error.message.includes("invalid")) {
            setMessage(
              "Lien de confirmation invalide. Veuillez vérifier votre email."
            );
          } else {
            setMessage("Erreur lors de la confirmation: " + error.message);
          }
          return;
        }

        if (session && session.user) {
          console.log("User confirmed successfully:", session.user.email);

          // Check if user has a coach profile
          const { data: coachData, error: profileError } = await supabase
            .from("coaches")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("Profile check error:", profileError);
            setStatus("error");
            setMessage(
              "Compte confirmé mais profil incomplet. Veuillez contacter le support."
            );
            return;
          }

          if (coachData) {
            setStatus("success");
            setMessage(
              `Bienvenue ${coachData.first_name}! Votre compte a été confirmé avec succès.`
            );

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/coach-dashboard");
            }, 3000);
          } else {
            setStatus("error");
            setMessage(
              "Profil coach non trouvé. Veuillez contacter le support."
            );
          }
        } else {
          // No session means confirmation failed
          setStatus("error");
          setMessage(
            "La confirmation a échoué. Veuillez réessayer ou contacter le support."
          );
        }
      } catch (error) {
        console.error("Unexpected error during confirmation:", error);
        setStatus("error");
        setMessage("Une erreur inattendue s'est produite. Veuillez réessayer.");
      }
    };

    // Small delay to ensure URL parameters are available
    const timer = setTimeout(handleEmailConfirmation, 100);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        {/* Logo */}
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

        {/* Status Content */}
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Confirmation en cours...
            </h1>
            <p className="text-gray-600">
              Nous confirmons votre adresse email. Veuillez patienter.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-green-900">
              Confirmation réussie!
            </h1>
            <p className="text-gray-600">{message}</p>
            <div className="text-sm text-gray-500">
              Redirection automatique vers le tableau de bord...
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

            {/* Action buttons for error cases */}
            <div className="space-y-3 pt-4">
              <Link href="/register">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  S&apos;inscrire à nouveau
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <Link
              href="/login"
              className="hover:text-gray-700 transition-colors"
            >
              Se connecter
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Accueil
            </Link>
            <span>•</span>
            <Link
              href="/help"
              className="hover:text-gray-700 transition-colors"
            >
              Aide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function ConfirmLoading() {
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
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Chargement...</h1>
          <p className="text-gray-600">
            Préparation de la confirmation de votre compte.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function ConfirmPage() {
  return (
    <Suspense fallback={<ConfirmLoading />}>
      <ConfirmContent />
    </Suspense>
  );
}
