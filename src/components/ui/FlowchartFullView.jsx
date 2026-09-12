import { choicesFor } from '../../lib/flow';
export default function FlowchartFullView({ data, onNavigate }) {
  return <section className="full-flow" aria-label="Complete policy path reference">
    <p>All steps and branches are listed below. This reference is the same content used by Guided Mode.</p>
    {data.nodes.map(node => <article className="review-card" id={data.id + '-' + node.id} key={node.id}>
      <h2>{node.label}</h2><p>{node.description}</p>
      {node.crossLink && <button className="guided-cross-link" onClick={() => onNavigate(node.crossLink.tool)}>{node.crossLink.label}</button>}
      {node.resourceLink && <p><a href={node.resourceLink.url} target="_blank" rel="noopener noreferrer">{node.resourceLink.label}</a></p>}
      <ul>{choicesFor(node).map(choice => <li key={choice.label}><strong>{choice.label}:</strong> {data.nodes.find(n => n.id === choice.next)?.label}</li>)}</ul>
      {node.type === 'end' && <p><strong>End of this path</strong></p>}
    </article>)}
  </section>;
}
