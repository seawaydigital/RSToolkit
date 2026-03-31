import { useState } from 'react';
import FlowchartFullView from './FlowchartFullView';
import FlowchartGuidedMode from './FlowchartGuidedMode';

export default function FlowchartViewer({ data, onNavigate }) {
  const [mode, setMode] = useState('full');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="tool-page-meta">
          <span>Last updated: {data.lastUpdated}</span>
          <span>Source: {data.policySource}</span>
        </div>
        <div className="flowchart-toggle">
          <button
            className={`flowchart-toggle-btn ${mode === 'full' ? 'flowchart-toggle-btn--active' : ''}`}
            onClick={() => setMode('full')}
          >
            Full View
          </button>
          <button
            className={`flowchart-toggle-btn ${mode === 'guided' ? 'flowchart-toggle-btn--active' : ''}`}
            onClick={() => setMode('guided')}
          >
            Guided Mode
          </button>
        </div>
      </div>

      {mode === 'full' ? (
        <FlowchartFullView data={data} onNavigate={onNavigate} />
      ) : (
        <FlowchartGuidedMode data={data} onNavigate={onNavigate} />
      )}
    </div>
  );
}
