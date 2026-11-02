import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--cosmic-border)] mb-6">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--cosmic-text)] font-mono">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-border)]">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-[var(--cosmic-text-muted)] mt-1 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
