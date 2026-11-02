import React from 'react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading Astronomical Observations...',
  subMessage = 'Retrieving multi-epoch FITS cutouts from SPHEREx archive'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-6">
      {/* Reticle Scanner */}
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border border-[var(--cosmic-border)]" />
        <div 
          className="absolute inset-1.5 rounded-full border border-dashed border-[var(--cosmic-cyan)]/50 animate-spin" 
          style={{ animationDuration: '4s' }} 
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[var(--cosmic-cyan)]" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-[var(--cosmic-text)] tracking-wide font-mono">{message}</h3>
      <p className="text-xs text-[var(--cosmic-text-muted)] mt-1 max-w-sm">{subMessage}</p>
    </div>
  );
};
