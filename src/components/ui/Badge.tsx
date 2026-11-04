import * as React from "react";

export function Badge({
  variant = "default",
  className = "",
  children,
}: {
  variant?: "default" | "success" | "purple" | "sponsor" | "outline";
  className?: string;
  children: React.ReactNode;
}) {
  const variants = {
    default: "bg-secondary text-secondary-foreground border-border",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    purple:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    sponsor:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    outline: "bg-transparent text-foreground border-border",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
