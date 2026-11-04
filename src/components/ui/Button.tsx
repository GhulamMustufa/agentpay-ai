import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glow" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5 font-semibold",
  };

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
    glow:
      "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:opacity-95 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01]",
    outline:
      "border border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground",
    ghost: "bg-transparent text-foreground hover:bg-muted/60",
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
