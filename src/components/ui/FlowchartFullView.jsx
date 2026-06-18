import { useMemo, useState } from 'react';
import dagre from 'dagre';

// Floor dimensions — nodes never render smaller than these.
const NODE_HEIGHT_ACTION = 58;
const NODE_HEIGHT_DECISION = 84;
const NODE_HEIGHT_TERMINAL = 42;
const MIN_WIDTH = 150;
const PADDING = 36;
const EDGE_COLOR = '#16a34a';
const EDGE_COLOR_NO = '#ef4444'; // "No" branch line/arrow, matching the red NO pill

// First point on the polyline at/below the given y, plus the unit direction of
// the segment it lies on. Used to anchor a label just past the source shape's
// bottom edge — the top of the visible arrow run — regardless of shape width.
function pointBelowY(pts, yThreshold) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (b.y >= yThreshold) {
      const t = b.y === a.y ? 0 : Math.max(0, Math.min(1, (yThreshold - a.y) / (b.y - a.y)));
      const segLen = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        dx: (b.x - a.x) / segLen,
        dy: (b.y - a.y) / segLen,
      };
    }
  }
  const a = pts[pts.length - 2] || pts[0];
  const b = pts[pts.length - 1];
  const segLen = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: b.x, y: b.y, dx: (b.x - a.x) / segLen, dy: (b.y - a.y) / segLen };
}

// The "No" branch out of a decision is drawn red to match its label; everything
// else (including the "Yes" branch) stays green. If an edge is BOTH the yes and
// no target (a decision whose answers converge), Yes/green wins — matching the
// YES label that EdgeLabel renders for that same edge.
function edgeColor(edge, nodes) {
  const src = nodes.find(n => n.id === edge.v);
  if (src && src.type === 'decision' && src.no === edge.w && src.yes !== edge.w) {
    return EDGE_COLOR_NO;
  }
  return EDGE_COLOR;
}

// Text metrics (Inter, 12px, weight 500). CHAR_W is an average glyph advance
// used to estimate line widths so we can size each shape to its own label.
const FONT_SIZE = 12;
const LINE_H = 16;
const CHAR_W = 6.7;

// Per-shape padding / wrap targets.
const RECT_PAD_X = 16;
const RECT_PAD_Y = 13;
const TERMINAL_PAD_X = 34; // pill end-caps eat horizontal room
const TERMINAL_PAD_Y = 11;
const WRAP_W_RECT = 200;
const WRAP_W_TERMINAL = 150;
const WRAP_W_DIAMOND = 150;
// Inscribed-rectangle budget for diamonds: a centered text block of width w
// and height h fits inside a diamond W×H when w/W + h/H <= 1. We size to 0.82
// so the text keeps an ~18% margin off the slanted edges. H_FACTOR sets how
// much of that budget the height consumes (h/H), the rest goes to width.
const DIAMOND_FILL = 0.82;
const DIAMOND_H_FACTOR = 0.33;

const textWidth = (line) => line.length * CHAR_W;
const maxLineWidth = (lines) => lines.reduce((m, l) => Math.max(m, textWidth(l)), 0);

function wrapText(text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (current && textWidth(trial) > maxW) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Compute the wrapped lines and the shape dimensions needed to contain them.
function computeNodeMeta(node) {
  if (node.type === 'decision') {
    const lines = wrapText(node.label, WRAP_W_DIAMOND);
    const w = maxLineWidth(lines);
    const h = lines.length * LINE_H;
    const height = Math.max(NODE_HEIGHT_DECISION, Math.ceil(h / DIAMOND_H_FACTOR));
    const width = Math.max(MIN_WIDTH, Math.ceil(w / (DIAMOND_FILL - h / height)));
    return { lines, width, height };
  }
  if (node.type === 'start' || node.type === 'end') {
    const lines = wrapText(node.label, WRAP_W_TERMINAL);
    const width = Math.max(MIN_WIDTH, Math.ceil(maxLineWidth(lines) + 2 * TERMINAL_PAD_X));
    const height = Math.max(NODE_HEIGHT_TERMINAL, lines.length * LINE_H + 2 * TERMINAL_PAD_Y);
    return { lines, width, height };
  }
  const lines = wrapText(node.label, WRAP_W_RECT);
  const width = Math.max(MIN_WIDTH, Math.ceil(maxLineWidth(lines) + 2 * RECT_PAD_X));
  const height = Math.max(NODE_HEIGHT_ACTION, lines.length * LINE_H + 2 * RECT_PAD_Y);
  return { lines, width, height };
}

function buildLayout(nodes) {
  const meta = {};
  for (const node of nodes) meta[node.id] = computeNodeMeta(node);

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', ranksep: 55, nodesep: 36 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    const m = meta[node.id];
    g.setNode(node.id, { width: m.width, height: m.height });
  }

  for (const node of nodes) {
    if (node.next) g.setEdge(node.id, node.next);
    if (node.yes) g.setEdge(node.id, node.yes, { label: 'Yes' });
    if (node.no) g.setEdge(node.id, node.no, { label: 'No' });
  }

  dagre.layout(g);
  return { g, meta };
}

const NODE_STYLES = {
  start:    { fill: '#0c1e3a', stroke: '#3b82f6', strokeWidth: 2,   text: '#93c5fd' },
  end:      { fill: '#052e16', stroke: '#16a34a', strokeWidth: 2,   text: '#86efac' },
  decision: { fill: '#111827', stroke: '#eab308', strokeWidth: 2,   text: '#ffffff' },
  action:   { fill: '#1e293b', stroke: '#334155', strokeWidth: 1.5, text: '#e2e8f0' },
};

function NodeShape({ node, layout, meta, onClick, isSelected }) {
  const pos = layout.node(node.id);
  if (!pos) return null;

  const { x, y } = pos;
  const w = pos.width;
  const h = pos.height;
  const s = NODE_STYLES[node.type] || NODE_STYLES.action;

  const stroke = isSelected ? '#ffffff' : s.stroke;
  const strokeWidth = isSelected ? 2.5 : s.strokeWidth;
  const filter = isSelected ? 'drop-shadow(0 0 6px rgba(255,255,255,0.35))' : undefined;

  const lines = meta[node.id].lines;
  const lineH = LINE_H;
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
          <tspan key={i} x={x} y={textY + i * lineH} dominantBaseline="central">
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

const ARROW_LEN = 9;  // arrowhead length
const ARROW_GAP = 6;  // breathing room left between the arrow tip and the target shape

// dagre routes edges to the target node's boundary. Pull the endpoint back by
// ARROW_GAP so the arrow tip stops just short of the shape (it used to be drawn
// AT the boundary with the tip pointing ARROW_LEN px *into* the shape).
function arrowGeometry(points) {
  const pts = points.points;
  const last = pts[pts.length - 1];
  const prev = pts.length > 1 ? pts[pts.length - 2] : pts[0];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
  const tip = {
    x: last.x - Math.cos(angle) * ARROW_GAP,
    y: last.y - Math.sin(angle) * ARROW_GAP,
  };
  return { tip, angle, pts };
}

// Edges render in two passes: the path sits behind the nodes, the arrowhead is
// drawn on top of them so it is never clipped by the shape it points into.
function EdgePath({ edge, layout, nodes }) {
  const points = layout.edge(edge);
  if (!points || !points.points) return null;

  const { tip, pts } = arrowGeometry(points);
  // End the line at the (gapped) arrow tip so it doesn't poke past the arrowhead.
  const routed = pts.slice(0, -1).concat([tip]);
  const d = routed.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  return <path d={d} fill="none" stroke={edgeColor(edge, nodes)} strokeWidth={1.5} />;
}

function EdgeArrow({ edge, layout, nodes }) {
  const points = layout.edge(edge);
  if (!points || !points.points) return null;

  const { tip, angle } = arrowGeometry(points);

  // Tip at the placement point, body trailing behind it along the travel direction.
  return (
    <polygon
      points={`0,0 ${-ARROW_LEN},-5 ${-ARROW_LEN},5`}
      fill={edgeColor(edge, nodes)}
      transform={`translate(${tip.x},${tip.y}) rotate(${(angle * 180) / Math.PI})`}
    />
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

  // Anchor the pill just below the source shape's bottom edge — the top of the
  // visible arrow run — so it clears the shape no matter how wide it is. Then
  // push it perpendicular to the LOCAL segment direction (branches can be
  // diagonal), to whichever side points AWAY from the source centre, so the
  // pill lands in open space beside the branch and never touches the line.
  const pts = edgeData.points;
  const src = layout.node(edge.v);
  // Centre the pill ON the branch's vertical descent so the line runs straight
  // down through the middle of the pill. Find where the branch stops fanning out
  // and goes vertical, and sit the pill at the top of that run — but never above
  // the source shape's bottom edge (the +12 keeps it clear of short, wide
  // diamonds). The line is drawn behind the opaque pill, so it reads as centred.
  const minY = src.y + src.height / 2 + 12;
  let vx = pts[pts.length - 1].x, vy = pts[pts.length - 1].y;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (Math.abs(b.x - a.x) < 4 && b.y > a.y + 1) { vx = a.x; vy = a.y; break; }
  }
  const cx = vx;
  const cy = Math.max(vy, minY);
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

  const { g: layout, meta } = useMemo(() => buildLayout(data.nodes), [data.nodes]);

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
          role="img"
          aria-label={`${data.title} decision flowchart. Use Guided Mode for a step-by-step, keyboard-accessible version.`}
        >
          <g transform={`translate(${PADDING}, ${PADDING})`}>
            {/* Edge paths sit behind the nodes */}
            {edges.map((edge, i) => (
              <EdgePath key={`path-${i}`} edge={edge} layout={layout} nodes={data.nodes} />
            ))}
            {data.nodes.map(node => (
              <NodeShape
                key={node.id}
                node={node}
                layout={layout}
                meta={meta}
                onClick={setSelectedNode}
                isSelected={selectedNode?.id === node.id}
              />
            ))}
            {/* Arrowheads and Yes/No labels render on top so they are never clipped by a node */}
            {edges.map((edge, i) => (
              <EdgeArrow key={`arrow-${i}`} edge={edge} layout={layout} nodes={data.nodes} />
            ))}
            {edges.map((edge, i) => (
              <EdgeLabel key={`label-${i}`} edge={edge} layout={layout} nodes={data.nodes} />
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
