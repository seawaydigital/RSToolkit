// Integrity checks for the two guided question trees: the STRA Lookup's
// assessment and the Dual-Use guide's self-assessment. A dangling `next:`
// leaves a researcher on a blank step, and a result that names a category the
// STRA list does not have shows no "matched category" button.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { straWizard } from '../src/data/straWizard.js';
import { dualUseWizard } from '../src/data/dualUseWizard.js';
import { straData } from '../src/data/straData.js';

const WIZARDS = { straWizard, dualUseWizard };

// Where an answer can lead: both branches of a yes/no, or every option.
function targets(node) {
  if (node.type === 'yesno') return [node.yes, node.no];
  if (node.type === 'choice') return node.options.map((o) => o.next);
  return [];
}

for (const [name, wizard] of Object.entries(WIZARDS)) {
  const nodes = wizard.questions;

  test(`${name}: the start node exists and is a question`, () => {
    const start = nodes[wizard.startQuestion];
    assert.ok(start, `${name}: startQuestion "${wizard.startQuestion}" does not exist`);
    assert.notEqual(start.type, 'result');
  });

  test(`${name}: every node is a yes/no, a choice or a result, with its text`, () => {
    for (const [id, node] of Object.entries(nodes)) {
      assert.ok(['yesno', 'choice', 'result'].includes(node.type), `${name}: ${id} has type "${node.type}"`);
      if (node.type === 'result') {
        assert.ok(node.title?.trim(), `${name}: ${id} needs a title`);
        assert.ok(node.description?.trim(), `${name}: ${id} needs a description`);
      } else {
        assert.ok(node.text?.trim(), `${name}: ${id} needs its question text`);
      }
      if (node.type === 'choice') {
        assert.ok(node.options.length >= 2, `${name}: ${id} needs at least two options`);
        for (const o of node.options) assert.ok(o.label?.trim(), `${name}: ${id} has an option with no label`);
      }
    }
  });

  test(`${name}: every answer leads to a node that exists`, () => {
    for (const [id, node] of Object.entries(nodes)) {
      for (const t of targets(node)) {
        assert.ok(t && nodes[t], `${name}: ${id} leads to "${t}", which does not exist`);
      }
    }
  });

  test(`${name}: every node can be reached from the start`, () => {
    const seen = new Set();
    const stack = [wizard.startQuestion];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      stack.push(...targets(nodes[id]));
    }
    assert.deepEqual(Object.keys(nodes).filter((id) => !seen.has(id)), [], `${name}: unreachable nodes`);
  });

  test(`${name}: no path loops, so every path ends at a result`, () => {
    const done = new Set();
    const onPath = new Set();
    const visit = (id) => {
      assert.ok(!onPath.has(id), `${name}: the questions loop back to ${id}`);
      if (done.has(id)) return;
      onPath.add(id);
      for (const t of targets(nodes[id])) visit(t);
      onPath.delete(id);
      done.add(id);
    };
    visit(wizard.startQuestion);
  });
}

test('straWizard: every matched category is a category on the STRA list', () => {
  const ids = new Set(straData.categories.map((c) => c.id));
  for (const [id, node] of Object.entries(straWizard.questions)) {
    if (node.type !== 'result') continue;
    assert.ok(Array.isArray(node.matchedCategories), `${id}: matchedCategories must be a list`);
    for (const c of node.matchedCategories) assert.ok(ids.has(c), `${id}: "${c}" is not a STRA category id`);
    assert.ok(['high', 'medium', 'low', 'none'].includes(node.riskLevel), `${id}: riskLevel "${node.riskLevel}"`);
  }
});

test('straWizard: every category on the STRA list is matched by at least one result', () => {
  const matched = new Set(
    Object.values(straWizard.questions).flatMap((n) => (n.type === 'result' ? n.matchedCategories : []))
  );
  const missing = straData.categories.map((c) => c.id).filter((id) => !matched.has(id));
  assert.deepEqual(missing, [], 'STRA categories no result points at');
});

test('straWizard: a result that matches no category says the research is unlikely to be on the list', () => {
  for (const [id, node] of Object.entries(straWizard.questions)) {
    if (node.type !== 'result') continue;
    const unlikely = node.riskLevel === 'low' || node.riskLevel === 'none';
    assert.equal(node.matchedCategories.length === 0, unlikely, `${id}: riskLevel and matchedCategories disagree`);
  }
});

test('dualUseWizard: every result has a signal, flags and next steps that point at tools that exist', () => {
  // toolRegistry.js imports browser-only modules, so its slugs are read as text.
  const registry = readFileSync(new URL('../src/data/toolRegistry.js', import.meta.url), 'utf8');
  const slugs = new Set([...registry.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]));
  assert.ok(slugs.size >= 15, 'could not read the tool slugs from toolRegistry.js');
  for (const [id, node] of Object.entries(dualUseWizard.questions)) {
    if (node.type !== 'result') continue;
    assert.ok(['likely', 'possible', 'low'].includes(node.signal), `${id}: signal "${node.signal}"`);
    assert.ok(node.flags.length > 0, `${id}: needs at least one flag`);
    assert.ok(node.nextSteps.length > 0, `${id}: needs at least one next step`);
    for (const step of node.nextSteps) {
      assert.ok(step.label?.trim(), `${id}: a next step has no label`);
      // tool: null sends the reader to the guide's own Dual-Use Areas tab.
      if (step.tool !== null) assert.ok(slugs.has(step.tool), `${id}: "${step.tool}" is not a tool slug`);
    }
  }
});
