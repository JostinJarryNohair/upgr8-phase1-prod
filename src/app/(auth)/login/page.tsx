"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DynamicInput from "@/components/common/DynamicInput";
import Image from "next/image";
import Link from "next/link";
import DynamicButton from "@/components/common/DynamicButton";
import { useRouter } from "next/navigation";

// Enhanced schema validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Le courriel est requis")
    .email("Format d'email invalide")
    .max(255, "L'email est trop long"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(100, "Le mot de passe est trop long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Constants
const MOCK_ACCOUNTS = [
  {
    email: "coach@upgr8.com",
    password: "coach123A111",
    type: "coach",
    name: "Coach Martin",
    redirectPath: "/dashboard/coach",
  },
  {
    email: "player@upgr8.com",
    password: "player123",
    type: "player",
    name: "Alexandre Dubois",
    redirectPath: "/player",
  },
] as const;

export default function LoginScreen() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const validateCredentials = (email: string, password: string) => {
    return MOCK_ACCOUNTS.find(
      (account) => account.email === email && account.password === password
    );
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Clear any previous errors
      clearErrors();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate credentials
      const account = validateCredentials(data.email, data.password);

      if (!account) {
        setError("root", {
          message: "Identifiants invalides. Veuillez réessayer.",
        });
        return;
      }

      // Store user session (in a real app, this would be handled by your auth system)
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("userType", account.type);
      sessionStorage.setItem("userName", account.name);
      sessionStorage.setItem("userEmail", account.email);

      // Success message could be shown here
      console.log("Connexion réussie pour:", account.name);

      // Redirect to appropriate dashboard
      router.push(account.redirectPath);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError("root", {
        message: "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div>
        {/* Logo */}
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="UpGr8 Logo"
            width={220}
            height={220}
            priority
            className="inline-flex items-center justify-center"
          />
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 -mt-20">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Connectez-vous à votre compte
            </h1>
            <p className="text-gray-600 text-sm">
              Bon retour ! Veuillez entrer vos informations.
            </p>

            {/* Demo Accounts */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
              <p className="text-xs font-medium text-blue-900 mb-2">
                Comptes de démonstration :
              </p>
              <div className="text-xs text-blue-800 space-y-1">
                <div>
                  <strong>Entraîneur :</strong> coach@upgr8.com / Coach123
                </div>
                <div>
                  <strong>Joueur :</strong> player@upgr8.com / Player123
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Global Error Display */}
            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{errors.root.message}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <DynamicInput
                type="email"
                id="email"
                placeholder="Entrez votre courriel"
                error={errors.email?.message}
                className="h-10 text-sm"
                {...register("email")}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe *
              </label>
              <DynamicInput
                type="password"
                id="password"
                placeholder="Entrez votre mot de passe"
                error={errors.password?.message}
                className="h-10 text-sm"
                {...register("password")}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 caractères avec majuscule, minuscule et chiffre
              </p>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit Button */}
            <DynamicButton
              label={isSubmitting ? "Connexion..." : "Se connecter"}
              type="submit"
              variant="default"
              className="w-full h-10 text-sm font-medium"
              disabled={isSubmitting}
            />

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Vous n&apos;avez pas de compte ?{" "}
                <Link
                  href="/register"
                  className="font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </span>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            © 2025 UpGr8
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            href="/privacy"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Politique de confidentialité
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            href="/terms"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Conditions d&apos;utilisation
          </Link>
        </div>
      </div>
    </div>
  );
}
