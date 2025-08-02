"use client";

import * as React from "react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { AuthApiError } from "@supabase/supabase-js";
import DynamicInput from "@/components/common/DynamicInput";
import Image from "next/image";
import Link from "next/link";
import DynamicButton from "@/components/common/DynamicButton";
import { useTranslation } from '@/hooks/useTranslation';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError(t('validation.required'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('validation.invalidEmail'));
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsEmailSent(true);
      setMessage(t('auth.resetPasswordEmailSent'));
    } catch (error: unknown) {
      console.error("Password reset error:", error);

      if (error instanceof AuthApiError) {
        switch (error.message) {
          case "User not found":
            setError(t('auth.userNotFound'));
            break;
          case "Too many requests":
            setError(t('auth.tooManyRequests'));
            break;
          default:
            setError(t('auth.resetPasswordError') + ": " + error.message);
        }
      } else if (error instanceof Error) {
        if (error.message.includes("User not found")) {
          setError(t('auth.userNotFound'));
        } else if (error.message.includes("Too many requests")) {
          setError(t('auth.tooManyRequests'));
        } else {
          setError(t('auth.resetPasswordError') + ": " + error.message);
        }
      } else {
        setError(t('auth.resetPasswordError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
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

        {/* Forgot Password Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 -mt-20">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              {t('auth.forgotPasswordTitle')}
            </h1>
            <p className="text-gray-600 text-sm">
              {isEmailSent 
                ? t('auth.resetPasswordEmailSentDescription')
                : t('auth.forgotPasswordSubtitle')
              }
            </p>
          </div>

        {!isEmailSent ? (
          /* Reset Password Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('auth.email')}
              </label>
              <DynamicInput
                type="email"
                id="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={handleEmailChange}
                error={error}
                className="h-10 text-sm"
              />
            </div>

            {/* Submit Button */}
            <DynamicButton
              label={loading ? t('common.loading') : t('auth.sendResetLink')}
              type="submit"
              variant="default"
              className="w-full h-10 text-sm font-medium"
              disabled={loading}
            />

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                {t('auth.backToLogin')}
              </Link>
            </div>
          </form>
        ) : (
          /* Success Message */
          <div className="space-y-4">
            {/* Success Display */}
            {message && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                {t('auth.checkEmailInstructions')}
              </p>
              
              <DynamicButton
                label={t('auth.backToLogin')}
                type="button"
                variant="outline"
                className="w-full h-10 text-sm font-medium"
                onClick={() => window.location.href = '/login'}
              />
            </div>
          </div>
        )}
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