"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

/**
 * Props for the DynamicButton component
 */
export interface DynamicButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
    | "onDrag"
    | "onDragEnd"
    | "onDragStart"
  > {
  /**
   * The text displayed on the button
   * Required unless size="icon" and an icon is provided
   */
  label: string;
  /**
   * Optional icon component from lucide-react
   */
  icon?: LucideIcon;
  /**
   * Position of the icon relative to the label
   * @default "left"
   */
  iconPosition?: "left" | "right";
  /**
   * Visual style variant of the button
   * @default "default"
   */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  /**
   * Size of the button
   * @default "default"
   */
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * DynamicButton Component
 *
 * A flexible button component with support for icons, multiple variants,
 * and sizes. Compatible with shadcn/ui design principles.
 *
 * Features:
 * - Multiple visual variants (default, destructive, outline, etc.)
 * - Size options including icon-only mode
 * - Flexible icon positioning (left or right)
 * - Full accessibility support
 */
export default function DynamicButton({
  className,
  variant = "default",
  size = "default",
  label,
  icon: Icon,
  iconPosition = "left",
  ...props
}: DynamicButtonProps) {
  // Base button styles
  const baseStyles = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors relative overflow-hidden",
    "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50"
  );

  // Variant styles
  const variantStyles = {
    default: "bg-red-600 text-white hover:bg-red-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "text-gray-900 hover:bg-gray-100",
    link: "text-red-600 underline-offset-4 hover:underline",
  };

  // Size styles
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 py-1 text-xs",
    lg: "h-12 px-8 py-3",
    icon: "h-10 w-10",
  };

  // Icon size based on button size
  const iconSize = {
    default: "h-4 w-4",
    sm: "h-3 w-3",
    lg: "h-5 w-5",
    icon: "h-5 w-5",
  };

  // Spacing between icon and label
  const iconSpacing =
    size === "icon" ? "" : iconPosition === "left" ? "mr-2" : "ml-2";

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      aria-label={size === "icon" ? label : undefined}
      {...props}
    >
      {/* Icon on the left */}
      {Icon && iconPosition === "left" && (
        <div className={cn("inline-flex", iconSpacing)}>
          <Icon className={cn(iconSize[size])} aria-hidden="true" />
        </div>
      )}

      {/* Label */}
      {size !== "icon" && <span className="inline-block">{label}</span>}

      {/* Icon on the right */}
      {Icon && iconPosition === "right" && (
        <div className={cn("inline-flex", iconSpacing)}>
          <Icon className={cn(iconSize[size])} aria-hidden="true" />
        </div>
      )}
    </button>
  );
}
