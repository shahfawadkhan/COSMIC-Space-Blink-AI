import React from 'react';
import { CandidateRecord } from '../../types/candidate';
import { PlotlyChart } from './PlotlyChart';

interface SpectralSEDChartProps {
  candidate: CandidateRecord;
}

export const SpectralSEDChart: React.FC<SpectralSEDChartProps> = ({ candidate }) => {
  const bands = candidate.spectralBands;

  if (!bands || bands.length === 0) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg p-6">
        <p className="text-slate-400 font-medium">Spectral Information Not Available</p>
        <p className="text-slate-600 mt-1">Multi-band SPHEREx spectrophotometry is pending pipeline extraction for this candidate.</p>
      </div>
    );
  }

  const xWavelengths = bands.map(b => b.wavelengthMicrons);
  const yFlux = bands.map(b => b.fluxMjy);
  const yErrors = bands.map(b => b.uncertainty);
  const bandNames = bands.map(b => `${b.band}: ${b.fluxMjy} mJy`);

  // Measured photometric points with error bars
  const scatterTrace: Plotly.Data = {
    x: xWavelengths,
    y: yFlux,
    text: bandNames,
    mode: 'markers',
    type: 'scatter',
    name: 'SPHEREx Band Flux',
    error_y: {
      type: 'data',
      array: yErrors,
      visible: true,
      color: '#55D6FF',
      thickness: 1.5,
      width: 4
    },
    marker: {
      size: 9,
      color: '#55D6FF',
      symbol: 'diamond',
      line: { color: '#F8FAFC', width: 1 }
    }
  };

  // Interpolated thermal/spectral continuum
  const continuumTrace: Plotly.Data = {
    x: xWavelengths,
    y: yFlux,
    mode: 'lines',
    type: 'scatter',
    name: 'SED Continuum Fit',
    line: {
      color: 'rgba(167, 139, 250, 0.7)',
      width: 2,
      shape: 'spline'
    },
    hoverinfo: 'none'
  };

  const layout: Partial<Plotly.Layout> = {
    title: {
      text: `SPHEREx Infrared Spectral Energy Distribution (0.75 - 5.0 µm)`,
      x: 0.02,
      xanchor: 'left'
    },
    xaxis: {
      title: { text: 'Wavelength λ [µm]' },
      zeroline: false
    },
    yaxis: {
      title: { text: 'Flux Density F_ν [mJy]' },
      zeroline: false
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.12,
      bgcolor: 'transparent'
    },
    margin: { l: 50, r: 24, t: 60, b: 45 }
  };

  return (
    <div className="w-full h-80">
      <PlotlyChart data={[continuumTrace, scatterTrace]} layout={layout} />
    </div>
  );
};
