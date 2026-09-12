import { useEffect, useRef } from 'react';
import { choicesFor } from '../../lib/flow';
import SourceNote from './SourceNote';

export default function FlowchartGuidedMode({ data, history, setHistory, onNavigate }) {
  const node = data.nodes.find(n => n.id === history.at(-1));
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, [node?.id]);
  if (!node) return <p role="alert">This path could not be restored. Open the official instructions.</p>;
  return <div className="guided-layout">
    <div className="guided-progress"><span>{node.type === 'end' ? 'Path complete' : 'Step ' + history.length}</span><span>{data.title}</span></div>
    <section className="guided-card" aria-labelledby="guided-heading">
      <h2 id="guided-heading" ref={heading} tabIndex={-1} className="guided-card-label">{node.label}</h2>
      <p className="guided-card-desc">{node.description}</p>
      {node.crossLink && <button className="guided-cross-link" onClick={() => onNavigate(node.crossLink.tool)}>{node.crossLink.label}</button>}
      {node.resourceLink && <p><a href={node.resourceLink.url} target="_blank" rel="noopener noreferrer">{node.resourceLink.label}</a></p>}
      <div className="guided-buttons">
        {history.length > 1 && <button className="guided-btn guided-btn--back" onClick={() => setHistory(history.slice(0, -1))}>Back</button>}
        {choicesFor(node).map(choice => <button key={choice.label} className="guided-btn guided-btn--continue" onClick={() => setHistory([...history, choice.next])}>{choice.label}</button>)}
        {node.type === 'end' && <button className="guided-btn guided-btn--continue" onClick={() => setHistory(['start'])}>Start Over</button>}
      </div>
    </section>
    {node.type === 'end' && <section className="review-card"><h2>Information used in this path</h2><ol>
      {history.slice(0, -1).map((id, index) => {
        const visited = data.nodes.find(n => n.id === id);
        const answer = choicesFor(visited).find(c => c.next === history[index + 1]);
        return <li key={id}>{visited.label}: <strong>{answer?.label}</strong></li>;
      })}
    </ol><SourceNote ids={data.sourceIds} /></section>}
  </div>;
}
