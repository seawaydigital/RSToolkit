import { useMemo, useState } from 'react';
import dagre from 'dagre';

const NODE_WIDTH = 220;
const NODE_HEIGHT_ACTION = 60;
const NODE_HEIGHT_DECISION = 80;
const NODE_HEIGHT_TERMINAL = 50;
const PADDING = 40;

function getNodeHeight(type) {
  if (type === 'decision') return NODE_HEIGHT_DECISION;
  if (type === 'start' || type === 'end') return NODE_HEIGHT_TERMINAL;
  return NODE_HEIGHT_ACTION;
}

function buildLayout(nodes) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 40 });
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

function NodeShape({ node, layout, onClick, isSelected }) {
  const pos = layout.node(node.id);
  if (!pos) return null;

  const x = pos.x;
  const y = pos.y;
  const w = NODE_WIDTH;
  const h = getNodeHeight(node.type);

  const colors = {
    start: { fill: '#3b82f6', stroke: '#2563eb', text: '#ffffff' },
    end: { fill: '#22c55e', stroke: '#16a34a', text: '#ffffff' },
    decision: { fill: '#7c3aed', stroke: '#6d28d9', text: '#ffffff' },
    action: { fill: '#1e293b', stroke: '#475569', text: '#f1f5f9' },
  };
  const c = colors[node.type] || colors.action;

  const selectedStroke = isSelected ? '#f59e0b' : c.stroke;
  const strokeWidth = isSelected ? 3 : 1.5;

  return (
    <g onClick={() => onClick(node)} style={{ cursor: 'pointer' }}>
      {node.type === 'decision' ? (
        <polygon
          points={`${x},${y - h / 2} ${x + w / 2},${y} ${x},${y + h / 2} ${x - w / 2},${y}`}
          fill={c.fill}
          stroke={selectedStroke}
          strokeWidth={strokeWidth}
          rx={4}
        />
      ) : node.type === 'start' || node.type === 'end' ? (
        <rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          rx={h / 2}
          fill={c.fill}
          stroke={selectedStroke}
          strokeWidth={strokeWidth}
        />
      ) : (
        <rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          rx={8}
          fill={c.fill}
          stroke={selectedStroke}
          strokeWidth={strokeWidth}
        />
      )}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={c.text}
        fontSize={12}
        fontWeight={500}
        style={{ pointerEvents: 'none' }}
      >
        {wrapText(node.label, 24).map((line, i, arr) => (
          <tspan key={i} x={x} dy={i === 0 ? -(arr.length - 1) * 7 : 14}>
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
  const d = allPoints
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const last = allPoints[allPoints.length - 1];
  const prev = allPoints.length > 1 ? allPoints[allPoints.length - 2] : allPoints[0];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x);

  return (
    <g>
      <path d={d} fill="none" stroke="#475569" strokeWidth={1.5} />
      <polygon
        points={`0,-5 10,0 0,5`}
        fill="#475569"
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

  const midIdx = Math.floor(edgeData.points.length / 2);
  const mid = edgeData.points[midIdx];

  return (
    <text
      x={mid.x + (isYes ? -20 : 20)}
      y={mid.y - 5}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
      fill={isYes ? '#22c55e' : '#ef4444'}
    >
      {isYes ? 'Yes' : 'No'}
    </text>
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
    <div>
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
        <div className="guided-card" style={{ marginTop: 16 }}>
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
          <button
            style={{
              marginTop: 12,
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: 13,
            }}
            onClick={() => setSelectedNode(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
