import { useId, useMemo, useRef, useState } from 'react';
import { choicesFor } from '../../lib/flow';
import { layoutFlow } from '../../lib/flowLayout';

export default function FlowchartDiagram({ data, onNavigate }) {
 const graph = useMemo(() => layoutFlow(data), [data]);
 const [selected, setSelected] = useState('start');
 const [zoom, setZoom] = useState(0.65);
 const viewport = useRef(null);
 const drag = useRef(null);
 const arrow = useId().replaceAll(':', '');
 const node = data.nodes.find(n => n.id === selected) || data.nodes[0];
 function focusNode(id) {
  setSelected(id);
  const element = viewport.current?.querySelector('[data-node-id="' + id + '"]');
  element?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  element?.focus({ preventScroll: true });
 }
 function fit() { setZoom(Math.min(1, (viewport.current.clientWidth - 24) / graph.width, (viewport.current.clientHeight - 24) / graph.height)); viewport.current.scrollTo(0, 0); }
 return <section className="flow-diagram screen-only" aria-label="Visual policy flowchart">
  <p>Follow the labelled arrows. Select any step for its full explanation. Exploring the diagram does not change your Guided Mode answers.</p>
  <div className="toolbar diagram-toolbar" aria-label="Diagram controls">
   <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} disabled={zoom >= 2} aria-label="Zoom in on flowchart">+</button>
   <button onClick={() => setZoom(z => Math.max(0.2, z - 0.15))} disabled={zoom <= 0.2} aria-label="Zoom out of flowchart">−</button>
   <button onClick={fit}>Fit diagram</button><button onClick={() => setZoom(1)}>Actual size</button>
   <button onClick={() => window.print()}>Print complete path reference</button>
   <span role="status">{Math.round(zoom * 100)}%</span>
  </div>
  <p id={arrow + '-help'} className="scope-note">Drag the background or scroll to pan. Keyboard: Tab to a step, then Enter or Space to select it. Text View provides every step without panning.</p>
  <div className="diagram-viewport" ref={viewport} tabIndex={0} role="region" aria-label="Scrollable flowchart" aria-describedby={arrow + '-help'}
   onPointerDown={event => { if (event.button !== 0 || event.target.closest('button')) return; drag.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop }; event.currentTarget.setPointerCapture(event.pointerId); }}
   onPointerMove={event => { if (!drag.current) return; event.currentTarget.scrollLeft = drag.current.left - event.clientX + drag.current.x; event.currentTarget.scrollTop = drag.current.top - event.clientY + drag.current.y; }}
   onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
   <div style={{ width: graph.width * zoom, height: graph.height * zoom, marginInline: 'auto' }}>
    <div className="diagram-canvas" style={{ width: graph.width, height: graph.height, transform: 'scale(' + zoom + ')' }}>
     <svg width={graph.width} height={graph.height} aria-hidden="true" focusable="false">
      <defs><marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
      {graph.edges.map(edge => <g className="diagram-edge" key={edge.name} data-edge-from={edge.v} data-edge-to={edge.w} data-edge-label={edge.label}>
       <path d={edge.points.map((p, i) => (i ? 'L' : 'M') + p.x + ',' + p.y).join(' ')} markerEnd={'url(#' + arrow + ')'} />
       <rect x={edge.x - edge.width / 2 - 5} y={edge.y - 13} width={edge.width + 10} height={26} rx={5} />
       <text x={edge.x} y={edge.y} dominantBaseline="central" textAnchor="middle">{edge.label}</text>
      </g>)}
      {graph.nodes.map(n => n.type === 'decision' ? <polygon key={n.id} className={'diagram-shape diagram-shape--decision ' + (selected === n.id ? 'is-selected' : '')} points={`${n.x},${n.y - n.height / 2} ${n.x + n.width / 2},${n.y} ${n.x},${n.y + n.height / 2} ${n.x - n.width / 2},${n.y}`} /> :
       <rect key={n.id} className={'diagram-shape diagram-shape--' + n.type + ' ' + (selected === n.id ? 'is-selected' : '')} x={n.x - n.width / 2} y={n.y - n.height / 2} width={n.width} height={n.height} rx={n.type === 'start' || n.type === 'end' ? 38 : 12} />)}
     </svg>
     {graph.nodes.map(n => <button key={n.id} data-node-id={n.id} className={'diagram-node diagram-node--' + n.type} style={{ left: n.x - n.width / 2, top: n.y - n.height / 2, width: n.width, height: n.height }} aria-pressed={selected === n.id} aria-controls={arrow + '-detail'} onClick={() => setSelected(n.id)}>
      <span>{n.lines.map((line, i) => <span className="diagram-node-line" key={i}>{line}</span>)}</span>
     </button>)}
    </div>
   </div>
  </div>
  <section className="review-card diagram-detail" id={arrow + '-detail'} aria-label="Selected step details" aria-live="polite">
   <h2>{node.label}</h2><p>{node.description}</p>
   {node.resourceLink && <p><a href={node.resourceLink.url} target="_blank" rel="noopener noreferrer">{node.resourceLink.label}</a></p>}
   {node.crossLink && <button onClick={() => onNavigate(node.crossLink.tool)}>{node.crossLink.label}</button>}
   <ul>{choicesFor(node).map(choice => <li key={choice.label}><button onClick={() => focusNode(choice.next)}>{choice.label}: {data.nodes.find(n => n.id === choice.next)?.label}</button></li>)}</ul>
   {node.type === 'end' && <p>End of this path. This is a reference outcome, not an assessment completed on your behalf.</p>}
  </section>
 </section>;
}
