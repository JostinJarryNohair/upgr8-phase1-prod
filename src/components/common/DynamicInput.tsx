"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Mail,
  Lock,
  CalendarDays,
  Eye,
  EyeOff,
  type LucideIcon,
} from "lucide-react";

export interface DynamicInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  error?: string;
  containerClassName?: string;
}

export default function DynamicInput({
  className,
  containerClassName,
  type = "text",
  label,
  id,
  name,
  icon,
  iconPosition = "left",
  error,
  ...props
}: DynamicInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const generatedId = React.useId();
  const inputId = id || name || generatedId;

  // Auto-assign icon based on type
  let Icon = icon;
  if (!Icon) {
    if (type === "email") Icon = Mail;
    else if (type === "password") Icon = Lock;
    else if (type === "date") Icon = CalendarDays;
  }

  // Determine actual input type
  const actualType = type === "password" && showPassword ? "text" : type;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={actualType}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-red-500 focus:ring-red-500",
            "text-gray-900 sm:text-sm",
            "disabled:bg-gray-50 disabled:text-gray-500",
            "px-3 py-2 border",
            Icon && iconPosition === "left" && "pl-10",
            Icon && iconPosition === "right" && "pr-10",
            type === "password" && "pr-10",
            error && "border-red-300",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {Icon && iconPosition === "right" && type !== "password" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}

        {type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-500" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
