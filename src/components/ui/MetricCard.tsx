import React from 'react';
import { Clock, Compass, AlertCircle, Database, Radio, Cpu, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Clock,
  Compass,
  AlertCircle,
  Database,
  Radio,
  Cpu
};

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  isPositiveChange?: boolean;
  description: string;
  iconName: 'Clock' | 'Compass' | 'AlertCircle' | 'Database' | 'Radio' | 'Cpu';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  change,
  isPositiveChange = true,
  description,
  iconName,
  badge
}) => {
  const IconComponent = ICON_MAP[iconName] || Compass;

  return (
    <div className="group relative bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] hover:border-[var(--cosmic-cyan)]/40 rounded-xl p-5 transition-all duration-200 shadow-sm flex flex-col justify-between">
      {/* Subtle accent highlight line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--cosmic-cyan)]/25 to-transparent group-hover:via-[var(--cosmic-cyan)]/70 transition-all duration-300 rounded-t-xl" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold tracking-wide text-[var(--cosmic-text-muted)] uppercase">
            {label}
          </span>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)] border border-[var(--cosmic-border)]">
                {badge}
              </span>
            )}
            <div className="p-2 rounded-lg bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-border)] group-hover:border-[var(--cosmic-cyan)]/40 transition-colors">
              <IconComponent className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold font-mono tracking-tight text-[var(--cosmic-text)] group-hover:text-[var(--cosmic-cyan)] transition-colors">
            {value}
          </div>
          {change && (
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                isPositiveChange
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}
            >
              {change}
            </span>
          )}
        </div>

        {subValue && (
          <div className="text-xs font-mono text-[var(--cosmic-text-muted)] mb-2">
            {subValue}
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--cosmic-text-muted)] mt-2 line-clamp-2 border-t border-[var(--cosmic-border)] pt-2.5">
        {description}
      </p>
    </div>
  );
};
