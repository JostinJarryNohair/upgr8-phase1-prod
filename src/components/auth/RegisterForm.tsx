"use client";

import { useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
  supabase,
  COACH_ROLES,
  COACHING_LEVELS,
  CoachingLevel,
  CoachRole,
} from "@/lib/supabase/client";
import { AuthApiError } from "@supabase/supabase-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DynamicInput from "@/components/common/DynamicInput";
import DynamicButton from "@/components/common/DynamicButton";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function RegisterForm() {
  const [userType, setUserType] = useState<'coach' | 'player'>('coach');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "" as CoachRole,
    coachingLevel: "" as CoachingLevel,
    profilePicture: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    coachingLevel: "",
  });

  const validate = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "",
      coachingLevel: "",
    };
    if (!formData.firstName) newErrors.firstName = "Le prénom est requis";
    if (!formData.lastName) newErrors.lastName = "Le nom de famille est requis";
    if (!formData.email) {
      newErrors.email = "Le courriel est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse courriel valide";
    }
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }
    
    // Conditional validation based on user type
    if (userType === 'coach') {
      if (!formData.role) newErrors.role = "Le rôle est requis";
      if (!formData.coachingLevel) newErrors.coachingLevel = "Le niveau est requis";
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const clearError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage("");

    try {
      // Check for existing user in appropriate table
      if (userType === 'coach') {
        const { data: existingUser } = await supabase
          .from("coaches")
          .select("email")
          .eq("email", formData.email)
          .single();

        if (existingUser) {
          setMessage("Erreur: Un compte entraîneur existe déjà avec cette adresse email.");
          return;
        }
      } else {
        const { data: existingUser } = await supabase
          .from("player_users")
          .select("email")
          .eq("email", formData.email)
          .single();

        if (existingUser) {
          setMessage("Erreur: Un compte joueur existe déjà avec cette adresse email.");
          return;
        }
      }

      // Single auth.signUp() call with metadata - trigger handles profile creation
      const signupData = userType === 'coach' 
        ? {
            user_type: 'coach',
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            coaching_level: formData.coachingLevel,
          }
        : {
            user_type: 'player',
            first_name: formData.firstName,
            last_name: formData.lastName,
            profile_picture: formData.profilePicture,
          };

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: signupData,
        },
      });

      if (authError) throw authError;

      console.log(
        "User created successfully! Trigger should create coach profile automatically:",
        authData.user?.id
      );

      setMessage(
        "Inscription réussie! Vérifiez votre email pour confirmer votre compte."
      );

      // Clear form on success
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "" as CoachRole,
        coachingLevel: "" as CoachingLevel,
        profilePicture: "",
      });
    } catch (error: unknown) {
      console.error("Registration error:", error);
      
      // Handle specific Supabase AuthApiError
      if (error instanceof AuthApiError) {
        switch (error.message) {
          case "User already registered":
            setMessage("Un compte existe déjà avec cette adresse email");
            break;
          case "Password should be at least 6 characters":
            setMessage("Le mot de passe doit contenir au moins 6 caractères");
            break;
          case "Invalid email":
            setMessage("Adresse email invalide");
            break;
          case "Too many requests":
            setMessage("Trop de tentatives. Réessayez dans quelques minutes");
            break;
          default:
            setMessage("Erreur d'inscription: " + error.message);
        }
      } else if (error instanceof Error) {
        // Handle other Error types
        if (error.message.includes("already exists")) {
          setMessage("Un compte existe déjà avec cette adresse email");
        } else if (error.message.includes("password")) {
          setMessage("Erreur avec le mot de passe");
        } else if (error.message.includes("email")) {
          setMessage("Erreur avec l'adresse email");
        } else {
          setMessage("Erreur d'inscription: " + error.message);
        }
      } else {
        setMessage("Erreur inconnue lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[55%] xl:w-[40%] flex items-center justify-center p-6 lg:p-8 bg-white">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 -mt-20 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Créer un compte
            </h1>
            <p className="text-gray-600 text-sm">
              Commencez votre parcours hockey avec UpGr8
            </p>
          </div>

          {/* User Type Tabs */}
          <Tabs value={userType} onValueChange={(value) => setUserType(value as 'coach' | 'player')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="coach" className="text-sm">
                Entraîneur
              </TabsTrigger>
              <TabsTrigger value="player" className="text-sm">
                Joueur
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coach">
              <div className="text-center py-2">
                <p className="text-sm text-gray-600">
                  Créez un compte pour gérer vos équipes et évaluer vos joueurs.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="player">
              <div className="text-center py-2">
                <p className="text-sm text-gray-600">
                  Rejoignez la communauté hockey et créez votre profil de joueur.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prénom
                </Label>
                <DynamicInput
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    clearError("firstName");
                  }}
                  error={errors.firstName}
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <Label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom de famille
                </Label>
                <DynamicInput
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                    clearError("lastName");
                  }}
                  error={errors.lastName}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Adresse courriel
              </Label>
              <DynamicInput
                id="email"
                type="email"
                placeholder="jean@exemple.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  clearError("email");
                }}
                error={errors.email}
                className="h-10 text-sm"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </Label>
              <DynamicInput
                id="password"
                type="password"
                placeholder="Créez un mot de passe robuste"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  clearError("password");
                }}
                error={errors.password}
                className="h-10 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Doit contenir au moins 6 caractères
              </p>
            </div>

            {/* Coach-specific fields */}
            {userType === 'coach' && (
              <>
                <div>
                  <Label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Rôle
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: CoachRole) => {
                      setFormData({ ...formData, role: value });
                      clearError("role");
                    }}
                  >
                    <SelectTrigger
                      className={
                        errors.role
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Sélectionnez votre rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {COACH_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="coachingLevel"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Niveau de coaching
                  </Label>
                  <Select
                    value={formData.coachingLevel}
                    onValueChange={(value: CoachingLevel) => {
                      setFormData({ ...formData, coachingLevel: value });
                      clearError("coachingLevel");
                    }}
                  >
                    <SelectTrigger
                      className={
                        errors.coachingLevel
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Sélectionnez votre niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {COACHING_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Player-specific fields */}
            {userType === 'player' && (
              <div>
                <Label
                  htmlFor="profilePicture"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Photo de profil (URL)
                </Label>
                <DynamicInput
                  id="profilePicture"
                  type="url"
                  placeholder="https://exemple.com/photo.jpg"
                  value={formData.profilePicture}
                  onChange={(e) => {
                    setFormData({ ...formData, profilePicture: e.target.value });
                  }}
                  error=""
                  className="h-10 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Entrez l'URL de votre photo de profil (optionnel)
                </p>
              </div>
            )}

            <DynamicButton
              label={loading ? "Création..." : "Créer le compte"}
              type="submit"
              variant="default"
              className="w-full h-10 text-sm font-medium"
              disabled={loading}
            />

            {message && (
              <p
                className={`text-sm text-center mt-2 ${
                  message.includes("Erreur") ? "text-red-600" : "text-green-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/login"
                className="font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Se connecter
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-[45%] xl:w-[60%] relative overflow-hidden bg-gray-100">
        <Image
          src="/signup.jpg"
          alt="Hockey players"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent" />
      </div>
    </div>
  );
}
