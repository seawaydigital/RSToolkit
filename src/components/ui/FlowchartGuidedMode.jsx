import { useState, useMemo } from 'react';

export default function FlowchartGuidedMode({ data, onNavigate }) {
  const [history, setHistory] = useState(['start']);

  const nodesById = useMemo(() => {
    const map = {};
    for (const node of data.nodes) {
      map[node.id] = node;
    }
    return map;
  }, [data.nodes]);

  const currentNodeId = history[history.length - 1];
  const currentNode = nodesById[currentNodeId];

  // Count total reachable nodes for progress (approximate)
  const totalNodes = data.nodes.length;
  const progress = Math.min((history.length / totalNodes) * 100, 100);

  function goTo(nextId) {
    setHistory(prev => [...prev, nextId]);
  }

  function goBack() {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  }

  function restart() {
    setHistory(['start']);
  }

  if (!currentNode) {
    return (
      <div className="guided-card">
        <div className="guided-card-label">Error</div>
        <div className="guided-card-desc">Node not found.</div>
        <div className="guided-buttons">
          <button className="guided-btn guided-btn--continue" onClick={restart}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const isEnd = currentNode.type === 'end';
  const isDecision = currentNode.type === 'decision';

  return (
    <div>
      <div className="guided-progress">
        <span>Step {history.length} of ~{totalNodes}</span>
        <span>{data.title}</span>
      </div>
      <div className="guided-progress-bar">
        <div className="guided-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="guided-card">
        <div className="guided-card-label">{currentNode.label}</div>
        <div className="guided-card-desc">{currentNode.description}</div>

        {currentNode.policyRef && (
          <div className="guided-card-ref">{currentNode.policyRef}</div>
        )}

        {currentNode.whyItMatters && (
          <div className="guided-card-why">{currentNode.whyItMatters}</div>
        )}

        {currentNode.crossLink && (
          <button
            className="guided-cross-link"
            onClick={() => onNavigate(currentNode.crossLink.tool)}
          >
            {currentNode.crossLink.label}
          </button>
        )}

        <div className="guided-buttons" style={{ marginTop: 20 }}>
          {history.length > 1 && (
            <button className="guided-btn guided-btn--back" onClick={goBack}>
              Back
            </button>
          )}

          {isDecision && (
            <>
              <button
                className="guided-btn guided-btn--yes"
                onClick={() => goTo(currentNode.yes)}
              >
                Yes
              </button>
              <button
                className="guided-btn guided-btn--no"
                onClick={() => goTo(currentNode.no)}
              >
                No
              </button>
            </>
          )}

          {!isDecision && !isEnd && currentNode.next && (
            <button
              className="guided-btn guided-btn--continue"
              onClick={() => goTo(currentNode.next)}
            >
              Continue
            </button>
          )}

          {isEnd && (
            <button className="guided-btn guided-btn--continue" onClick={restart}>
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
