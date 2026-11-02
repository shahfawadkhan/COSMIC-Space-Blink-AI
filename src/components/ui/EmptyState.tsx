import React from 'react';
import { Search, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-[var(--cosmic-border)] rounded-xl bg-[var(--cosmic-surface-subtle)] my-4">
      <div className="w-10 h-10 rounded-lg bg-[var(--cosmic-surface)] flex items-center justify-center text-[var(--cosmic-text-muted)] mb-3 border border-[var(--cosmic-border)]">
        <Icon className="w-5 h-5 text-[var(--cosmic-cyan)]" />
      </div>
      <h4 className="text-sm font-semibold text-[var(--cosmic-text)] mb-1 font-mono">{title}</h4>
      <p className="text-xs text-[var(--cosmic-text-muted)] max-w-md mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 rounded-lg bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-cyan)]/40 text-xs font-semibold tracking-wide transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
