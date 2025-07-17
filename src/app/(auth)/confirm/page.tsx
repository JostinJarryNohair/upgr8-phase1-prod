// src/app/(auth)/confirm/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Main confirmation component that handles the email verification logic
 * This component needs to be separate from the page component because
 * useSearchParams() requires a Suspense boundary in Next.js 14
 */
function ConfirmContent() {
  const router = useRouter();
  // useSearchParams() reads URL parameters like ?token=abc&type=signup
  // In Next.js 14, this MUST be wrapped in <Suspense> because it's dynamic
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    /**
     * This function handles the email confirmation process:
     * 1. Supabase automatically processes the token when the page loads
     * 2. We need to listen for auth state changes to detect confirmation
     * 3. Then verify the user has a coach profile in our database
     * 4. Show success/error and redirect accordingly
     */
    const handleEmailConfirmation = async () => {
      try {
        // Get URL parameters for debugging
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        const error = searchParams.get("error");
        const error_description = searchParams.get("error_description");

        console.log("Confirmation attempt:", {
          token: token?.substring(0, 10) + "...",
          type,
          error,
          error_description,
        });

        // Check if there's an error in the URL
        if (error) {
          setStatus("error");
          if (error === "expired_token") {
            setMessage(
              "Le lien de confirmation a expiré. Veuillez vous inscrire à nouveau."
            );
          } else if (error === "invalid_token") {
            setMessage(
              "Lien de confirmation invalide. Veuillez vérifier votre email."
            );
          } else {
            setMessage(`Erreur de confirmation: ${error_description || error}`);
          }
          return;
        }

        // Set up auth state listener to detect when user gets confirmed
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state change:", event, session?.user?.email);

          if (event === "SIGNED_IN" && session?.user) {
            // User was just confirmed and signed in
            try {
              // Verify that the user has a complete coach profile
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

                // Automatically redirect to dashboard after 3 seconds
                setTimeout(() => {
                  router.push("/coach-dashboard");
                }, 3000);
              } else {
                setStatus("error");
                setMessage(
                  "Profil coach non trouvé. Veuillez contacter le support."
                );
              }
            } catch (err) {
              console.error("Error verifying coach profile:", err);
              setStatus("error");
              setMessage("Erreur lors de la vérification du profil.");
            }
          } else if (event === "TOKEN_REFRESHED") {
            // Token was refreshed, check if user is now confirmed
            if (session?.user?.email_confirmed_at) {
              // Trigger the same logic as SIGNED_IN
              handleEmailConfirmation();
            }
          }
        });

        // Also check current session in case user is already signed in
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession?.user?.email_confirmed_at) {
          // User is already confirmed, check their profile
          const { data: coachData, error: profileError } = await supabase
            .from("coaches")
            .select("*")
            .eq("id", currentSession.user.id)
            .single();

          if (profileError) {
            console.error("Profile check error:", profileError);
            setStatus("error");
            setMessage(
              "Compte confirmé mais profil incomplet. Veuillez contacter le support."
            );
          } else if (coachData) {
            setStatus("success");
            setMessage(
              `Bienvenue ${coachData.first_name}! Votre compte a été confirmé avec succès.`
            );
            setTimeout(() => {
              router.push("/coach-dashboard");
            }, 3000);
          } else {
            setStatus("error");
            setMessage(
              "Profil coach non trouvé. Veuillez contacter le support."
            );
          }
        } else if (
          currentSession?.user &&
          !currentSession.user.email_confirmed_at
        ) {
          // User exists but not confirmed yet, wait for confirmation
          console.log("User exists but not confirmed yet, waiting...");
        } else {
          // No session, wait for auth state change
          console.log("No session, waiting for confirmation...");
        }

        // Set timeout to show error if nothing happens after 10 seconds
        const timeoutId = setTimeout(() => {
          if (status === "loading") {
            setStatus("error");
            setMessage(
              "La confirmation a pris trop de temps. Veuillez réessayer ou contacter le support."
            );
          }
        }, 10000);

        // Cleanup
        return () => {
          subscription.unsubscribe();
          clearTimeout(timeoutId);
        };
      } catch (error) {
        console.error("Unexpected error during confirmation:", error);
        setStatus("error");
        setMessage("Une erreur inattendue s'est produite. Veuillez réessayer.");
      }
    };

    handleEmailConfirmation();
  }, [searchParams, router, status]);

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

        {/* Loading State: Shown while processing the confirmation */}
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

        {/* Success State: Email confirmed and user verified */}
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

        {/* Error State: Something went wrong with confirmation */}
        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-red-900">
              Erreur de confirmation
            </h1>
            <p className="text-gray-600">{message}</p>

            {/* Recovery options for users when confirmation fails */}
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

/**
 * Loading fallback component shown while useSearchParams() is resolving
 * This is required by Next.js 14 when using dynamic functions like useSearchParams()
 * during server-side rendering
 */
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

/**
 * Main page component with Suspense wrapper
 *
 * WHY SUSPENSE IS NEEDED:
 * - useSearchParams() is a dynamic function that reads URL parameters
 * - During server-side rendering, URL parameters aren't available yet
 * - Next.js 14 requires wrapping it in <Suspense> to handle this gracefully
 * - The fallback component shows while the parameters are being resolved
 *
 * THE FLOW:
 * 1. User clicks email confirmation link: /confirm?token=abc&type=signup
 * 2. Next.js renders ConfirmLoading first (fallback)
 * 3. Once search params are ready, ConfirmContent renders
 * 4. ConfirmContent processes the token and shows result
 */
export default function ConfirmPage() {
  return (
    <Suspense fallback={<ConfirmLoading />}>
      <ConfirmContent />
    </Suspense>
  );
}
