import React from 'react';
import { CandidateStatus, CandidatePriority } from '../../types/candidate';
import { getStatusBadgeStyle, getPriorityBadgeStyle } from '../../lib/astroUtils';

interface StatusBadgeProps {
  status: CandidateStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const style = getStatusBadgeStyle(status);
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: CandidatePriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const style = getPriorityBadgeStyle(priority);

  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}
    >
      {priority} Priority
    </span>
  );
};
