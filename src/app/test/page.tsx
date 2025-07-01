"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  COACH_ROLES,
  COACHING_LEVELS,
  CoachingLevel,
  CoachRole,
} from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DynamicInput from "@/components/common/DynamicInput";

export default function TestRegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "" as CoachRole,
    coachingLevel: "" as CoachingLevel,
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
    if (!formData.email) newErrors.email = "Le courriel est requis";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    if (!formData.role) newErrors.role = "Le rôle est requis";
    if (!formData.coachingLevel)
      newErrors.coachingLevel = "Le niveau est requis";
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage("");
    setTimeout(() => {
      setLoading(false);
      setMessage(
        "Inscription réussie! Vérifiez votre email pour confirmer votre compte."
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 lg:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src="/logo.png"
              alt="UpGr8 Logo"
              width={120}
              height={40}
              priority
              className="mb-2"
            />
          </div>
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Créer un compte
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Commencez votre parcours hockey avec UpGr8
          </p>

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
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className={
                    errors.firstName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.firstName}
                  </p>
                )}
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
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className={
                    errors.lastName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                )}
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
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
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={
                  errors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Doit contenir au moins 8 caractères
              </p>
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={(value: CoachRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
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
              {errors.role && (
                <p className="text-sm text-red-600 mt-1">{errors.role}</p>
              )}
            </div>
            <div>
              <Label htmlFor="coachingLevel">Niveau de coaching</Label>
              <Select
                value={formData.coachingLevel}
                onValueChange={(value: CoachingLevel) =>
                  setFormData({ ...formData, coachingLevel: value })
                }
              >
                <SelectTrigger>
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
              {errors.coachingLevel && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.coachingLevel}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 text-white hover:bg-red-700 rounded-md py-2 text-base font-semibold mt-2"
              disabled={loading}
            >
              {loading ? "Création..." : "Créer le compte"}
            </Button>
            {message && (
              <p className="text-sm text-center text-green-600 mt-2">
                {message}
              </p>
            )}
          </form>
          <div className="text-center text-base mt-6">
            <span className="text-gray-600">
              Vous avez déjà un compte ?{" "}
              <a
                href="/login"
                className="font-bold text-red-600 hover:underline"
              >
                Se connecter
              </a>
            </span>
          </div>
        </div>
      </div>
      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-[60%] relative overflow-hidden bg-gray-100">
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
