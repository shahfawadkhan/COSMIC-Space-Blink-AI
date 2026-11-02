import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useSettings } from '../../context/SettingsContext';

export interface PlotlyChartProps {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  className?: string;
  style?: React.CSSProperties;
  onHover?: (event: Plotly.PlotMouseEvent) => void;
  onClick?: (event: Plotly.PlotMouseEvent) => void;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({
  data,
  layout,
  config,
  className = 'w-full h-full min-h-[280px]',
  style,
  onHover,
  onClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const isLight = settings.theme === 'light-observatory';

  useEffect(() => {
    if (!containerRef.current) return;

    const themeTextColor = isLight ? '#475569' : '#94A3B8';
    const themeTitleColor = isLight ? '#0F172A' : '#F8FAFC';
    const themeGridColor = isLight ? 'rgba(0,0,0,0.08)' : '#1E293B';
    const themeHoverBg = isLight ? '#FFFFFF' : '#101827';
    const themeHoverText = isLight ? '#0F172A' : '#F8FAFC';

    // Merge layout with theme awareness
    const mergedTitle = typeof layout.title === 'string'
      ? { text: layout.title, font: { color: themeTitleColor, size: 13, family: 'Inter, sans-serif' } }
      : layout.title
      ? { ...layout.title, font: { color: themeTitleColor, ...(layout.title.font || {}) } }
      : undefined;

    const defaultLayout: Partial<Plotly.Layout> = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: 'Inter, sans-serif',
        color: themeTextColor,
        size: 11
      },
      margin: { l: 48, r: 24, t: 36, b: 40 },
      autosize: true,
      hovermode: 'closest',
      hoverlabel: {
        bgcolor: themeHoverBg,
        bordercolor: isLight ? '#0284C7' : '#55D6FF',
        font: { family: 'JetBrains Mono, monospace', color: themeHoverText, size: 12 }
      },
      ...layout,
      title: mergedTitle,
      xaxis: {
        gridcolor: themeGridColor,
        tickfont: { color: themeTextColor, family: 'JetBrains Mono, monospace', size: 10 },
        ...(layout.xaxis || {})
      },
      yaxis: {
        gridcolor: themeGridColor,
        tickfont: { color: themeTextColor, family: 'JetBrains Mono, monospace', size: 10 },
        ...(layout.yaxis || {})
      }
    };

    const defaultConfig: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: 'cosmic-observation-chart',
        height: 600,
        width: 1000,
        scale: 2
      },
      ...config
    };

    // Render or update plot
    Plotly.react(containerRef.current, data, defaultLayout, defaultConfig);

    const el = containerRef.current as any;
    if (onHover && el.on) {
      el.on('plotly_hover', onHover);
    }
    if (onClick && el.on) {
      el.on('plotly_click', onClick);
    }

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    // ResizeObserver ensures instant responsive resize when sidebars collapse or layouts shift
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (el && el.removeAllListeners) {
        el.removeAllListeners('plotly_hover');
        el.removeAllListeners('plotly_click');
      }
    };
  }, [data, layout, config, isLight, onHover, onClick]);

  return <div ref={containerRef} className={className} style={style} />;
};
