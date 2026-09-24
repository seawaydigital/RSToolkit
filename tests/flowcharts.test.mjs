// Graph-integrity checks for every flowchart data module. The flows are the
// site's decision logic; a dangling `yes:` target or an unreachable node is a
// content bug that renders as a dead end for a researcher.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stracFlow } from '../src/data/flowcharts/stracFlow.js';
import { nsgrpFlow } from '../src/data/flowcharts/nsgrpFlow.js';
import { ontarioFlow } from '../src/data/flowcharts/ontarioFlow.js';

const FLOWS = { stracFlow, nsgrpFlow, ontarioFlow };

for (const [name, flow] of Object.entries(FLOWS)) {
  test(`${name}: node ids are unique`, () => {
    const ids = flow.nodes.map((n) => n.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate id in ${name}`);
  });

  test(`${name}: exactly one start node`, () => {
    assert.equal(flow.nodes.filter((n) => n.type === 'start').length, 1);
  });

  test(`${name}: every branch target exists`, () => {
    const ids = new Set(flow.nodes.map((n) => n.id));
    for (const n of flow.nodes) {
      for (const key of ['next', 'yes', 'no']) {
        if (n[key] !== undefined) {
          assert.ok(ids.has(n[key]), `${name}: ${n.id}.${key} -> "${n[key]}" does not exist`);
        }
      }
    }
  });

  test(`${name}: decisions have yes and no; ends have no outgoing edge; others have next`, () => {
    for (const n of flow.nodes) {
      if (n.type === 'decision') {
        assert.ok(n.yes && n.no, `${name}: decision ${n.id} needs yes and no`);
        assert.equal(n.next, undefined, `${name}: decision ${n.id} must not have next`);
      } else if (n.type === 'end') {
        assert.ok(!n.next && !n.yes && !n.no, `${name}: end ${n.id} must have no outgoing edge`);
      } else {
        assert.ok(n.next, `${name}: ${n.type} ${n.id} needs next`);
      }
    }
  });

  test(`${name}: every node is reachable from start`, () => {
    const byId = Object.fromEntries(flow.nodes.map((n) => [n.id, n]));
    const start = flow.nodes.find((n) => n.type === 'start');
    const seen = new Set();
    const stack = [start.id];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      const n = byId[id];
      for (const key of ['next', 'yes', 'no']) if (n[key]) stack.push(n[key]);
    }
    const unreachable = flow.nodes.map((n) => n.id).filter((id) => !seen.has(id));
    assert.deepEqual(unreachable, [], `${name}: unreachable nodes`);
  });

  test(`${name}: every path from start reaches an end`, () => {
    const byId = Object.fromEntries(flow.nodes.map((n) => [n.id, n]));
    const start = flow.nodes.find((n) => n.type === 'start');
    const memo = new Map();
    const reachesEnd = (id, trail) => {
      if (memo.has(id)) return memo.get(id);
      if (trail.has(id)) return false; // cycle without an end
      const n = byId[id];
      if (n.type === 'end') return true;
      const next = new Set(trail).add(id);
      const out = ['next', 'yes', 'no'].filter((k) => n[k]).map((k) => reachesEnd(n[k], next));
      const ok = out.length > 0 && out.every(Boolean);
      memo.set(id, ok);
      return ok;
    };
    assert.ok(reachesEnd(start.id, new Set()), `${name}: a path from start never reaches an end node`);
  });
}

test('nsgrpFlow: a required RAF is never waived by the Annex A / Annex B answers', () => {
  const byId = Object.fromEntries(nsgrpFlow.nodes.map((n) => [n.id, n]));
  assert.ok(byId['raf-required'], 'raf-required node must exist');
  assert.ok(byId['submit-raf'], 'submit-raf node must exist');
  // Every path from raf-required to an end must pass through submit-raf:
  // with submit-raf taken out of the graph, no end node may be reachable.
  const seen = new Set();
  const stack = ['raf-required'];
  while (stack.length) {
    const id = stack.pop();
    if (seen.has(id) || id === 'submit-raf') continue;
    seen.add(id);
    const n = byId[id];
    assert.notEqual(n.type, 'end', `"${id}" is reachable from raf-required without submitting the RAF`);
    for (const key of ['next', 'yes', 'no']) if (n[key]) stack.push(n[key]);
  }
  assert.ok(!nsgrpFlow.nodes.some((n) => n.id === 'attest'), 'STRAC attestation does not belong in the NSGRP flow');
});
