import React from 'react';
import { CandidateRecord } from '../../types/candidate';
import { PlotlyChart } from './PlotlyChart';

interface MotionChartProps {
  candidate: CandidateRecord;
}

export const MotionChart: React.FC<MotionChartProps> = ({ candidate }) => {
  const detections = candidate.epochsDetected;
  
  if (!detections || detections.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center text-slate-500 font-mono text-xs">
        No epoch astrometric detections available.
      </div>
    );
  }

  const baseRa = detections[0].ra;
  const baseDec = detections[0].dec;
  const rad = Math.PI / 180;
  const cosDec = Math.cos(baseDec * rad);

  // Convert to relative arcseconds offset from Epoch 1
  const xOffsets = detections.map(d => (d.ra - baseRa) * cosDec * 3600);
  const yOffsets = detections.map(d => (d.dec - baseDec) * 3600);
  const textLabels = detections.map(d => `${d.epoch}: ${d.timestamp.substring(5, 16).replace('T', ' ')} (SNR ${d.snr})`);

  // Scatter points for epoch detections
  const scatterTrace: Plotly.Data = {
    x: xOffsets,
    y: yOffsets,
    text: textLabels,
    mode: 'markers+text',
    type: 'scatter',
    name: 'Observed Position',
    textposition: 'top right',
    textfont: {
      family: 'JetBrains Mono, monospace',
      size: 11,
      color: '#55D6FF'
    },
    marker: {
      size: 12,
      color: '#55D6FF',
      symbol: 'circle-dot',
      line: { color: '#F8FAFC', width: 1.5 }
    }
  };

  // Trajectory track line
  const lineTrace: Plotly.Data = {
    x: xOffsets,
    y: yOffsets,
    mode: 'lines',
    type: 'scatter',
    name: 'Astrometric Track',
    line: {
      color: '#A78BFA',
      width: 2,
      dash: 'dot'
    },
    hoverinfo: 'none'
  };

  const layout: Partial<Plotly.Layout> = {
    title: {
      text: `Astrometric Trajectory Track — ΔRA vs ΔDec (Arcseconds from T1)`,
      x: 0.02,
      xanchor: 'left'
    },
    xaxis: {
      title: { text: 'Δα cos(δ) [arcsec]' }
    },
    yaxis: {
      title: { text: 'Δδ [arcsec]' },
      scaleanchor: 'x',
      scaleratio: 1
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.12,
      bgcolor: 'transparent'
    },
    annotations: [
      {
        text: `Rate: ${candidate.apparentMotionArcsecPerHour.toFixed(2)} ″/hr | χ² fit: ${candidate.motionVector.chiSquareFit}`,
        xref: 'paper',
        yref: 'paper',
        x: 0.98,
        y: 0.04,
        xanchor: 'right',
        yanchor: 'bottom',
        showarrow: false,
        font: { family: 'JetBrains Mono, monospace', size: 10, color: '#A78BFA' },
        bgcolor: 'rgba(15, 23, 42, 0.75)',
        bordercolor: 'rgba(148, 163, 184, 0.25)',
        borderwidth: 1
      }
    ],
    margin: { l: 50, r: 24, t: 60, b: 45 }
  };

  return (
    <div className="w-full h-80">
      <PlotlyChart data={[lineTrace, scatterTrace]} layout={layout} />
    </div>
  );
};
