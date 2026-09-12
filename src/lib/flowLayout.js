import { graphlib, layout } from '@dagrejs/dagre';
import { choicesFor } from './flow';

export function wrapLabel(label, limit = 29) {
 const lines = [];
 for (const word of label.split(/\s+/)) {
  const last = lines.length - 1;
  if (last < 0 || lines[last].length + word.length + 1 > limit) lines.push(word);
  else lines[last] += ' ' + word;
 }
 return lines;
}

export function layoutFlow(data) {
 const graph = new graphlib.Graph({ multigraph: true });
 graph.setGraph({ rankdir: 'TB', ranksep: 76, nodesep: 38, edgesep: 28, marginx: 28, marginy: 28 });
 graph.setDefaultEdgeLabel(() => ({}));
 for (const node of data.nodes) {
  const lines = wrapLabel(node.label, node.type === 'decision' ? 25 : 29);
  graph.setNode(node.id, { ...node, lines, width: node.type === 'decision' ? 384 : 268, height: node.type === 'decision' ? Math.max(212, lines.length * 44 + 48) : Math.max(80, lines.length * 22 + 34) });
 }
 for (const node of data.nodes) choicesFor(node).forEach((choice, index) => {
  graph.setEdge(node.id, choice.next, { label: choice.label, width: Math.max(65, choice.label.length * 8), height: 24, labelpos: 'c' }, node.id + '-' + index);
 });
 layout(graph);
 return {
  width: graph.graph().width, height: graph.graph().height,
  nodes: data.nodes.map(node => graph.node(node.id)),
  edges: graph.edges().map(edge => {
   const result = { ...edge, ...graph.edge(edge) };
   // Dagre clips against rectangles; decision edges must meet the diamond itself.
   for (const [id, index, neighbor] of [[edge.v, 0, 1], [edge.w, result.points.length - 1, result.points.length - 2]]) {
    const node = graph.node(id);
    if (node.type !== 'decision') continue;
    const dx = result.points[neighbor].x - node.x, dy = result.points[neighbor].y - node.y;
    const scale = Math.abs(dx) / (node.width / 2) + Math.abs(dy) / (node.height / 2);
    if (scale) result.points[index] = { x: node.x + dx / scale, y: node.y + dy / scale };
   }
   return result;
  }),
 };
}
