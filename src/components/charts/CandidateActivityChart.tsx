import React from 'react';
import { PlotlyChart } from './PlotlyChart';

interface CandidateActivityChartProps {
  title?: string;
}

export const CandidateActivityChart: React.FC<CandidateActivityChartProps> = ({
  title = 'Candidate Review Activity & Triage Volume by Observation Epoch'
}) => {
  const epochs = ['Epoch 1 (T1)', 'Epoch 2 (T2)', 'Epoch 3 (T3)', 'Epoch 4 (T4)'];

  const data: Plotly.Data[] = [
    {
      x: epochs,
      y: [6, 12, 14, 10],
      name: 'Needs Review',
      type: 'bar',
      marker: {
        color: '#FBBF24',
        opacity: 0.9,
        line: { color: '#D97706', width: 1 }
      }
    },
    {
      x: epochs,
      y: [3, 4, 6, 8],
      name: 'Under Investigation',
      type: 'bar',
      marker: {
        color: '#55D6FF',
        opacity: 0.9,
        line: { color: '#0284C7', width: 1 }
      }
    },
    {
      x: epochs,
      y: [4, 5, 5, 6],
      name: 'Known Object Match',
      type: 'bar',
      marker: {
        color: '#34D399',
        opacity: 0.9,
        line: { color: '#059669', width: 1 }
      }
    },
    {
      x: epochs,
      y: [1, 2, 1, 1],
      name: 'Possible Artifact',
      type: 'bar',
      marker: {
        color: '#F43F5E',
        opacity: 0.9,
        line: { color: '#BE123C', width: 1 }
      }
    }
  ];

  const layout: Partial<Plotly.Layout> = {
    title: {
      text: title,
      x: 0.02,
      xanchor: 'left'
    },
    barmode: 'stack',
    xaxis: {
      title: { text: 'Observation Sweep' }
    },
    yaxis: {
      title: { text: 'Candidate Count' }
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.15,
      bgcolor: 'transparent'
    },
    margin: { l: 45, r: 20, t: 70, b: 40 }
  };

  return (
    <div className="w-full h-72">
      <PlotlyChart data={data} layout={layout} />
    </div>
  );
};
