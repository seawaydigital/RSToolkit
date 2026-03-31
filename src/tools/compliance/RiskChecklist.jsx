import { useState } from 'react';
import { riskChecklist } from '../../data/riskChecklist';

export default function RiskChecklist({ onNavigate }) {
  const [itemStates, setItemStates] = useState(() => {
    const initial = {};
    riskChecklist.sections.forEach(section => {
      section.items.forEach(item => {
        initial[item.id] = item.defaultState;
      });
    });
    return initial;
  });

  const [expandedItems, setExpandedItems] = useState({});

  const toggleState = (itemId, newState) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: prev[itemId] === newState ? null : newState,
    }));
  };

  const toggleLearnMore = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const getSectionProgress = (section) => {
    const total = section.items.length;
    const completed = section.items.filter(item => itemStates[item.id] !== null).length;
    return { total, completed };
  };

  const getOverallProgress = () => {
    let total = 0;
    let completed = 0;
    riskChecklist.sections.forEach(section => {
      const p = getSectionProgress(section);
      total += p.total;
      completed += p.completed;
    });
    return { total, completed };
  };

  const overall = getOverallProgress();

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Risk Assessment Checklist</h1>
        <p>Interactive grant application risk assessment walkthrough</p>
        <div className="tool-page-meta">
          <span>Last updated: {riskChecklist.lastUpdated}</span>
          <a href={riskChecklist.sourceUrl} target="_blank" rel="noopener noreferrer">
            Policy source
          </a>
        </div>
      </div>

      <div className="checklist-progress">
        {riskChecklist.sections.map(section => {
          const p = getSectionProgress(section);
          return (
            <div key={section.id} className="checklist-progress-item">
              <strong>{section.title}:</strong> {p.completed}/{p.total}
            </div>
          );
        })}
        <div className="checklist-progress-item">
          <strong>Overall:</strong> {overall.completed}/{overall.total}
        </div>
      </div>

      {riskChecklist.sections.map(section => (
        <div key={section.id} className="checklist-section">
          <div className="checklist-section-header">
            <span className="checklist-section-title">{section.title}</span>
            <span className="checklist-section-source">{section.policySource}</span>
          </div>

          {section.items.map(item => {
            const state = itemStates[item.id];
            return (
              <div
                key={item.id}
                className={`checklist-item${state === 'risk' ? ' checklist-item--risk' : ''}`}
              >
                <div className="checklist-item-label">{item.label}</div>
                <div className="checklist-item-controls">
                  <button
                    className={`checklist-state-btn${state === 'no-risk' ? ' checklist-state-btn--no-risk' : ''}`}
                    onClick={() => toggleState(item.id, 'no-risk')}
                  >
                    No Risk
                  </button>
                  <button
                    className={`checklist-state-btn${state === 'risk' ? ' checklist-state-btn--risk' : ''}`}
                    onClick={() => toggleState(item.id, 'risk')}
                  >
                    Risk Identified
                  </button>
                  <button
                    className={`checklist-state-btn${state === 'na' ? ' checklist-state-btn--na' : ''}`}
                    onClick={() => toggleState(item.id, 'na')}
                  >
                    N/A
                  </button>
                  <button
                    className="checklist-learn-more-toggle"
                    onClick={() => toggleLearnMore(item.id)}
                  >
                    {expandedItems[item.id] ? 'Hide Details' : 'Learn More'}
                  </button>
                </div>
                {expandedItems[item.id] && (
                  <div className="checklist-learn-more">
                    <p>{item.learnMore}</p>
                    <p style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      Ref: {item.policyRef}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <button className="checklist-print-btn" onClick={() => window.print()}>
        Print Checklist
      </button>
    </div>
  );
}
