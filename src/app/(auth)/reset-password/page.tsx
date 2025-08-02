"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { AuthApiError } from "@supabase/supabase-js";
import DynamicInput from "@/components/common/DynamicInput";
import Image from "next/image";
import Link from "next/link";
import DynamicButton from "@/components/common/DynamicButton";
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setError(t('auth.invalidResetLink'));
        return;
      }

      // Check if this is a password recovery session
      if (session.user?.aud === 'authenticated' && session.user?.app_metadata?.provider === 'email') {
        setIsValidSession(true);
      } else {
        setError(t('auth.invalidResetLink'));
      }
    };

    checkSession();
  }, [t]);

  const validateForm = () => {
    if (!password) {
      setError(t('validation.passwordRequired'));
      return false;
    }
    if (password.length < 6) {
      setError(t('validation.passwordTooShort'));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t('validation.passwordsDoNotMatch'));
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setIsSuccess(true);
      setMessage(t('auth.passwordResetSuccess'));
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: unknown) {
      console.error("Password update error:", error);

      if (error instanceof AuthApiError) {
        switch (error.message) {
          case "Password should be at least 6 characters":
            setError(t('validation.passwordTooShort'));
            break;
          case "User not found":
            setError(t('auth.userNotFound'));
            break;
          case "Invalid token":
            setError(t('auth.invalidResetLink'));
            break;
          default:
            setError(t('auth.passwordResetError') + ": " + error.message);
        }
      } else if (error instanceof Error) {
        if (error.message.includes("Password should be at least 6 characters")) {
          setError(t('validation.passwordTooShort'));
        } else if (error.message.includes("User not found")) {
          setError(t('auth.userNotFound'));
        } else if (error.message.includes("Invalid token")) {
          setError(t('auth.invalidResetLink'));
        } else {
          setError(t('auth.passwordResetError') + ": " + error.message);
        }
      } else {
        setError(t('auth.passwordResetError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error) setError("");
  };

  if (!isValidSession && error) {
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

          {/* Error Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 -mt-20">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-gray-900 mb-1">
                {t('auth.resetPasswordError')}
              </h1>
              <p className="text-gray-600 text-sm">
                {error}
              </p>
            </div>

            <div className="text-center">
              <DynamicButton
                label={t('auth.backToLogin')}
                type="button"
                variant="default"
                className="w-full h-10 text-sm font-medium"
                onClick={() => router.push('/login')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Reset Password Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 -mt-20">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              {isSuccess ? t('auth.passwordResetSuccessTitle') : t('auth.resetPasswordTitle')}
            </h1>
            <p className="text-gray-600 text-sm">
              {isSuccess 
                ? t('auth.passwordResetSuccessDescription')
                : t('auth.resetPasswordSubtitle')
              }
            </p>
          </div>

        {!isSuccess ? (
          /* Reset Password Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* New Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('auth.newPassword')}
              </label>
              <DynamicInput
                type="password"
                id="password"
                placeholder={t('auth.newPassword')}
                value={password}
                onChange={handlePasswordChange}
                error={error}
                className="h-10 text-sm"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('auth.confirmNewPassword')}
              </label>
              <DynamicInput
                type="password"
                id="confirmPassword"
                placeholder={t('auth.confirmNewPassword')}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={error}
                className="h-10 text-sm"
              />
            </div>

            {/* Submit Button */}
            <DynamicButton
              label={loading ? t('common.loading') : t('auth.resetPassword')}
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
                {t('auth.redirectingToLogin')}
              </p>
              
              <DynamicButton
                label={t('auth.backToLogin')}
                type="button"
                variant="outline"
                className="w-full h-10 text-sm font-medium"
                onClick={() => router.push('/login')}
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