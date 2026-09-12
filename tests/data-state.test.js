import { describe, it, expect } from 'vitest';
import { newAssessment, validateAssessment, summarizeAnswers } from '../src/lib/assessment.js';
import { searchOrganizations, normalizedName } from '../src/lib/nroSearch.js';
import { riskChecklist } from '../src/data/riskChecklist.js';
const items = riskChecklist.sections.flatMap(s => s.items);
const ids = items.map(i => i.id);
describe('Worksheet integrity', () => {
 it('starts blank with a unique ID and strips unpersisted exploratory data', () => {
  const a = newAssessment(), b = newAssessment();
  expect(a.id).not.toBe(b.id); expect(a.answers).toEqual({});
  expect(validateAssessment({ ...a, flows: { nsgrp: ['start'] }, stra: { assessment: 'advances' } }, ids)).toMatchObject({ flows: {}, stra: {} });
 });
 it.each([{ schema: 1 }, { contentVersion: 'old' }, { id: '<script>' }, { answers: [] }, { answers: { bogus: 'risk' } }, { answers: { [ids[0]]: 'approved' } }, { createdAt: 'invalid' }, { institution: 'invented' }])('rejects malformed or stale input %j', patch => {
  expect(validateAssessment({ ...newAssessment(), ...patch }, ids)).toBeNull();
 });
 it('complete can still mean every item has an unresolved concern', () => {
  const summary = summarizeAnswers(items, Object.fromEntries(ids.map(id => [id, 'risk'])));
  expect(summary).toMatchObject({ total: 14, answered: 14, risks: 14, unanswered: 0 });
  expect(summarizeAnswers(items, { bogus: 'risk', [ids[0]]: 'approved', [ids[1]]: 'unknown' })).toMatchObject({ answered: 1, unknown: 1, unanswered: 13 });
 });
});
describe('Local organization name search', () => {
 it('distinguishes official name, alias and possible name', () => {
  expect(searchOrganizations('Beihang University')[0].label).toBe('Official name result');
  expect(searchOrganizations('BUAA')[0].label).toBe('Official alias result');
  expect(searchOrganizations('Beihang Universit')[0].label).toBe('Possible name candidate');
 });
 it('normalizes punctuation without turning candidates into identity confirmation', () => {
  expect(normalizedName('B.U.A.A.')).toBe('buaa');
  expect(searchOrganizations('B.U.A.A.')[0].label).toBe('Official alias result');
  expect(searchOrganizations('A fabricated university 999xyz')).toEqual([]);
  expect(searchOrganizations('<img src=x onerror=alert(1)>')).toEqual([]);
 });
 it('has deterministic country filtering, no duplicates and no geographic matching', () => {
  expect(searchOrganizations('', 'China').every(r => r.organization.country === 'China')).toBe(true);
  expect(searchOrganizations('', 'not-a-country')).toEqual([]);
  const results = searchOrganizations('Beihang University');
  expect(new Set(results.map(r => r.organization.id)).size).toBe(results.length);
  expect(results[0].organization).not.toHaveProperty('lat');
 });
});
