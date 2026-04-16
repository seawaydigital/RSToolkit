import { useMemo, useState } from 'react';
import dagre from 'dagre';

const NODE_WIDTH = 220;
const NODE_HEIGHT_ACTION = 60;
const NODE_HEIGHT_DECISION = 90;
const NODE_HEIGHT_TERMINAL = 44;
const PADDING = 40;
const EDGE_COLOR = '#16a34a';

function getNodeHeight(type) {
  if (type === 'decision') return NODE_HEIGHT_DECISION;
  if (type === 'start' || type === 'end') return NODE_HEIGHT_TERMINAL;
  return NODE_HEIGHT_ACTION;
}

function buildLayout(nodes) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', ranksep: 70, nodesep: 50 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: getNodeHeight(node.type) });
  }

  for (const node of nodes) {
    if (node.next) g.setEdge(node.id, node.next);
    if (node.yes) g.setEdge(node.id, node.yes, { label: 'Yes' });
    if (node.no) g.setEdge(node.id, node.no, { label: 'No' });
  }

  dagre.layout(g);
  return g;
}

const NODE_STYLES = {
  start:    { fill: '#0c1e3a', stroke: '#3b82f6', strokeWidth: 2,   text: '#93c5fd' },
  end:      { fill: '#052e16', stroke: '#16a34a', strokeWidth: 2,   text: '#86efac' },
  decision: { fill: '#111827', stroke: '#eab308', strokeWidth: 2,   text: '#ffffff' },
  action:   { fill: '#1e293b', stroke: '#334155', strokeWidth: 1.5, text: '#e2e8f0' },
};

function NodeShape({ node, layout, onClick, isSelected }) {
  const pos = layout.node(node.id);
  if (!pos) return null;

  const { x, y } = pos;
  const w = NODE_WIDTH;
  const h = getNodeHeight(node.type);
  const s = NODE_STYLES[node.type] || NODE_STYLES.action;

  const stroke = isSelected ? '#ffffff' : s.stroke;
  const strokeWidth = isSelected ? 2.5 : s.strokeWidth;
  const filter = isSelected ? 'drop-shadow(0 0 6px rgba(255,255,255,0.35))' : undefined;

  const lines = wrapText(node.label, 26);
  const lineH = 14;
  const textY = y - ((lines.length - 1) * lineH) / 2;

  return (
    <g onClick={() => onClick(node)} style={{ cursor: 'pointer', filter }}>
      {node.type === 'decision' ? (
        <polygon
          points={`${x},${y - h / 2} ${x + w / 2},${y} ${x},${y + h / 2} ${x - w / 2},${y}`}
          fill={s.fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ) : node.type === 'start' || node.type === 'end' ? (
        <rect
          x={x - w / 2} y={y - h / 2}
          width={w} height={h}
          rx={h / 2}
          fill={s.fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ) : (
        <rect
          x={x - w / 2} y={y - h / 2}
          width={w} height={h}
          rx={10}
          fill={s.fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )}
      <text
        textAnchor="middle"
        fill={s.text}
        fontSize={12}
        fontWeight={500}
        style={{ pointerEvents: 'none' }}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={x} y={textY + i * lineH}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function EdgeLine({ edge, layout }) {
  const points = layout.edge(edge);
  if (!points || !points.points) return null;

  const allPoints = points.points;
  const d = allPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  const last = allPoints[allPoints.length - 1];
  const prev = allPoints.length > 1 ? allPoints[allPoints.length - 2] : allPoints[0];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x);

  return (
    <g>
      <path d={d} fill="none" stroke={EDGE_COLOR} strokeWidth={1.5} />
      <polygon
        points="0,-5 9,0 0,5"
        fill={EDGE_COLOR}
        transform={`translate(${last.x},${last.y}) rotate(${(angle * 180) / Math.PI})`}
      />
    </g>
  );
}

function EdgeLabel({ edge, layout, nodes }) {
  const edgeData = layout.edge(edge);
  if (!edgeData || !edgeData.points) return null;

  const sourceNode = nodes.find(n => n.id === edge.v);
  if (!sourceNode || sourceNode.type !== 'decision') return null;

  const isYes = sourceNode.yes === edge.w;
  const isNo = sourceNode.no === edge.w;
  if (!isYes && !isNo) return null;

  // Place label on the first segment after the diamond exit (not the edge midpoint)
  const pts = edgeData.points;
  const labelPt = pts.length > 1 ? pts[1] : pts[0];

  const cx = labelPt.x + (isYes ? -28 : 28);
  const cy = labelPt.y;
  const pillW = 38;
  const pillH = 20;
  const pillRx = 10;

  const pillFill   = isYes ? '#14532d' : '#450a0a';
  const pillStroke = isYes ? '#22c55e' : '#ef4444';
  const textColor  = isYes ? '#86efac' : '#fca5a5';
  const label      = isYes ? 'YES' : 'NO';

  return (
    <g>
      <rect
        x={cx - pillW / 2} y={cy - pillH / 2}
        width={pillW} height={pillH}
        rx={pillRx}
        fill={pillFill}
        stroke={pillStroke}
        strokeWidth={1.5}
      />
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={700}
        fill={textColor}
        style={{ letterSpacing: '0.6px' }}
      >
        {label}
      </text>
    </g>
  );
}

export default function FlowchartFullView({ data, onNavigate }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const layout = useMemo(() => buildLayout(data.nodes), [data.nodes]);

  const graph = layout.graph();
  const svgWidth = (graph.width || 400) + PADDING * 2;
  const svgHeight = (graph.height || 300) + PADDING * 2;

  const edges = layout.edges();

  return (
    <div className="flowchart-outer">
      <div className="flowchart-svg-container">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ display: 'block', margin: '0 auto' }}
        >
          <g transform={`translate(${PADDING}, ${PADDING})`}>
            {edges.map((edge, i) => (
              <EdgeLine key={i} edge={edge} layout={layout} />
            ))}
            {edges.map((edge, i) => (
              <EdgeLabel key={`label-${i}`} edge={edge} layout={layout} nodes={data.nodes} />
            ))}
            {data.nodes.map(node => (
              <NodeShape
                key={node.id}
                node={node}
                layout={layout}
                onClick={setSelectedNode}
                isSelected={selectedNode?.id === node.id}
              />
            ))}
          </g>
        </svg>
      </div>

      {selectedNode && (
        <div className="flowchart-node-panel">
          <button
            className="flowchart-node-panel-close"
            onClick={() => setSelectedNode(null)}
            aria-label="Close"
          >
            ✕
          </button>
          <div className="guided-card-label">{selectedNode.label}</div>
          <div className="guided-card-desc">{selectedNode.description}</div>
          {selectedNode.policyRef && (
            <div className="guided-card-ref">{selectedNode.policyRef}</div>
          )}
          {selectedNode.whyItMatters && (
            <div className="guided-card-why">{selectedNode.whyItMatters}</div>
          )}
          {selectedNode.crossLink && (
            <button
              className="guided-cross-link"
              onClick={() => onNavigate(selectedNode.crossLink.tool)}
            >
              {selectedNode.crossLink.label}
            </button>
          )}
          {selectedNode.resourceLink && (
            <a
              className="flowchart-resource-link"
              href={selectedNode.resourceLink.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {selectedNode.resourceLink.label}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
