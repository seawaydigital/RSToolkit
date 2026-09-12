import { describe, it, expect } from 'vitest';
import { nsgrpFlow } from '../src/data/flowcharts/nsgrpFlow.js';
import { stracFlow } from '../src/data/flowcharts/stracFlow.js';
import { ontarioFlow } from '../src/data/flowcharts/ontarioFlow.js';
import { choicesFor, validateFlow, validHistory } from '../src/lib/flow.js';
import { sourcesCurrent } from '../src/data/policySources.js';
function walk(flow, answers) {
 let node = flow.nodes.find(n => n.id === 'start');
 const path = [node.id];
 for (let guard = 0; guard < 50 && node.type !== 'end'; guard++) {
  const next = node.type === 'decision' ? node[answers.shift()] : node.next;
  node = flow.nodes.find(n => n.id === next);
  if (!node) throw new Error('Invalid test path');
  path.push(node.id);
 }
 return { outcome: node.outcome, path };
}
describe('Official-rule regression cases (matrix P01-P12)', () => {
 it.each(['yes', 'no', 'unknown'])('NSGRP private partner: risk answer %s never waives RAF', risk => {
  const r = walk(nsgrpFlow, ['yes', 'yes', risk]);
  expect(r.path).toContain('raf');
  expect(r.outcome).toMatch(/^raf-required/);
  expect(r.path).not.toContain('attest');
 });
 it('NSGRP public/non-profit-only, outside and unknown scope remain distinct', () => {
  expect(walk(nsgrpFlow, ['yes', 'no']).outcome).toBe('no-private-partner');
  expect(walk(nsgrpFlow, ['no']).outcome).toBe('outside-scope');
  expect(walk(nsgrpFlow, ['unknown']).outcome).toBe('needs-information');
 });
 it.each(['affiliation', 'funding', 'in-kind support'])('STRAC explicitly includes %s', connection => {
  expect(stracFlow.nodes.find(n => n.id === 'connection').description).toContain(connection);
  expect(walk(stracFlow, ['yes', 'yes', 'yes']).outcome).toBe('connection-unresolved');
 });
 it('STRAC no-connection result requires roles and distinguishes unnamed trainees', () => {
  const r = walk(stracFlow, ['yes', 'yes', 'no']);
  expect(r.path).toContain('roles');
  expect(r.outcome).toBe('attestation-required');
  const roles = stracFlow.nodes.find(n => n.id === 'roles').description;
  expect(roles).toContain('Unnamed trainees');
  expect(roles).toContain('CIHR collaborators are excluded');
  expect(roles).toContain('other named users do not');
 });
 it('STRA non-advancement and uncertain advancement are different results', () => {
  expect(walk(stracFlow, ['yes', 'no']).outcome).toBe('no-stra-attestation');
  expect(walk(stracFlow, ['yes', 'unknown']).outcome).toBe('needs-information');
  expect(stracFlow.nodes.find(n => n.id === 'program').description).toMatch(/Historical awards, extensions and changed project scope/);
 });
 it('Ontario past, planned, unrelated and co-publication links are expressly in scope', () => {
  const text = ontarioFlow.nodes.map(n => n.description).join(' ');
  for (const term of ['two years before signing', 'anticipated project completion', 'other projects', 'co-publication', 'planned connections']) expect(text).toContain(term);
  expect(walk(ontarioFlow, ['yes', 'yes']).path).toContain('option-b');
  expect(walk(ontarioFlow, ['yes', 'no']).path).not.toContain('option-b');
  expect(walk(ontarioFlow, ['yes', 'unknown']).outcome).toBe('needs-information');
 });
});
describe('Flow safety and freshness', () => {
 it.each([nsgrpFlow, stracFlow, ontarioFlow])('$id: all decisions have explicit uncertainty and all paths terminate', flow => {
  expect(validateFlow(flow)).toEqual([]);
  for (const node of flow.nodes.filter(n => n.type === 'decision')) {
   const unknown = flow.nodes.find(n => n.id === node.unknown);
   expect(unknown.outcome).toMatch(/unresolved|needs-information/);
  }
  expect(validHistory(flow, ['start', ...choicesFor(flow.nodes[0]).map(c => c.next)])).toBe(true);
  expect(validHistory(flow, ['start', 'fabricated'])).toBe(false);
 });
 it('rejects cyclic, missing and duplicate nodes', () => {
  expect(validateFlow({ nodes: [{ id: 'start', type: 'action', next: 'start' }] })).toContain('Cycle: start');
  expect(validateFlow({ nodes: [{ id: 'start', type: 'action', next: 'missing' }] })).toContain('Missing node: missing');
  expect(validateFlow({ nodes: [{ id: 'start', type: 'end' }, { id: 'start', type: 'end' }] })).toContain('Duplicate node ID');
 });
 it('source checks fail closed on unknown IDs, invalid clocks and overdue dates', () => {
  expect(sourcesCurrent(['nsgrp'], '2026-09-12T00:00:00Z')).toBe(true);
  expect(sourcesCurrent(['nsgrp'], '2026-10-13T00:00:00Z')).toBe(false);
  expect(sourcesCurrent(['nsgrp'], '2026-09-11')).toBe(false);
  expect(sourcesCurrent(['bad'], '2026-09-12')).toBe(false);
  expect(sourcesCurrent([], '2026-09-12')).toBe(false);
  expect(sourcesCurrent(['nsgrp'], 'bad-date')).toBe(false);
 });
});
