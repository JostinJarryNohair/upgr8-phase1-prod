"use client";

import { useState } from "react";
import {
  supabase,
  CoachRole,
  CoachingLevel,
  COACH_ROLES,
  COACHING_LEVELS,
} from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegisterForm() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Step 1: Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        console.log("User created with ID:", authData.user.id); // DEBUG

        // Wait a moment for user to be fully created
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { data: coachData, error: profileError } = await supabase
          .from("coaches")
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            role: formData.role,
            coaching_level: formData.coachingLevel,
          })
          .select(); // This returns the inserted data

        console.log("Coach insert result:", { coachData, profileError }); // DEBUG

        if (profileError) {
          console.error("Detailed profile error:", profileError);
          throw new Error(`Profile error: ${profileError.message}`);
        }
      }

      setMessage(
        "Inscription réussie! Vérifiez votre email pour confirmer votre compte."
      );
    } catch (error: unknown) {
      console.error("Full error:", error); // DEBUG
      if (error instanceof Error) {
        setMessage("Erreur: " + error.message);
      } else {
        setMessage("Erreur inconnue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg border">
      <h2 className="text-2xl font-bold mb-6 text-center">Inscription Coach</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="role">Rôle</Label>
          <Select
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
        </div>

        <div>
          <Label htmlFor="coachingLevel">Niveau de coaching</Label>
          <Select
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
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Inscription..." : "S'inscrire"}
        </Button>

        {message && (
          <p
            className={`text-sm text-center ${
              message.includes("Erreur") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
