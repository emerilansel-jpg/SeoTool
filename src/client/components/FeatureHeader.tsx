import type { ComponentType, ReactNode } from "react";

export interface FeatureHeaderProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  badge: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export function FeatureHeader({
  icon: Icon,
  title,
  badge,
  description,
  actions,
  className = "",
}: FeatureHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Icon className="size-5 sm:size-6 text-primary shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-base-content">
            {title}
          </h1>
          <span className="badge badge-primary badge-sm font-semibold">
            {badge}
          </span>
        </div>
        <p className="mt-1 text-xs text-base-content/60 leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
