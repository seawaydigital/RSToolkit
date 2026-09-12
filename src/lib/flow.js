export function choicesFor(node) {
  if (node.choices) return node.choices;
  if (node.type === 'decision') return [{ label: 'Yes', next: node.yes }, { label: 'No', next: node.no }, { label: 'Not sure', next: node.unknown }];
  return node.next ? [{ label: 'Continue', next: node.next }] : [];
}

export function validateFlow(flow) {
  const errors = [];
  const ids = flow.nodes.map(n => n.id);
  if (new Set(ids).size !== ids.length) errors.push('Duplicate node ID');
  const byId = Object.fromEntries(flow.nodes.map(n => [n.id, n]));
  const seen = new Set();
  function visit(id, ancestors = new Set()) {
    if (!byId[id]) { errors.push('Missing node: ' + id); return; }
    if (ancestors.has(id)) { errors.push('Cycle: ' + id); return; }
    if (seen.has(id)) return;
    seen.add(id);
    const node = byId[id];
    if (node.type === 'decision' && !node.choices && !node.unknown) errors.push('No uncertain path: ' + id);
    if (node.type !== 'end' && !choicesFor(node).length) errors.push('Unfinished path: ' + id);
    choicesFor(node).forEach(c => visit(c.next, new Set([...ancestors, id])));
  }
  visit('start');
  ids.filter(id => !seen.has(id)).forEach(id => errors.push('Unreachable: ' + id));
  return errors;
}

export function validHistory(flow, history) {
  if (!Array.isArray(history) || history[0] !== 'start' || history.length > flow.nodes.length) return false;
  return history.every((id, index) => {
    const node = flow.nodes.find(n => n.id === id);
    return node && (index === history.length - 1 || choicesFor(node).some(c => c.next === history[index + 1]));
  });
}
