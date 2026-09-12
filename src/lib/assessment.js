import { CONTENT_VERSION } from '../data/policySources.js';

export const STORAGE_KEY = 'rs-toolkit-assessment-v2';
export const LEGACY_KEY = 'rs-toolkit-checklist-v1';
export const ANSWERS = ['risk', 'no-risk', 'unknown', 'na'];
export function newAssessment() {
  return { schema: 2, contentVersion: CONTENT_VERSION, id: crypto.randomUUID(), createdAt: new Date().toISOString(), institution: 'other', answers: {}, flows: {}, stra: {} };
}
export function validateAssessment(value, allowedIds) {
  if (!value || value.schema !== 2 || value.contentVersion !== CONTENT_VERSION || typeof value.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(value.id)) return null;
  if (!Number.isFinite(Date.parse(value.createdAt)) || !['other', 'lakehead'].includes(value.institution)) return null;
  if (!value.answers || Array.isArray(value.answers) || typeof value.answers !== 'object') return null;
  if (Object.entries(value.answers).some(([id, answer]) => !allowedIds.includes(id) || !ANSWERS.includes(answer))) return null;
  // Persist only the minimal worksheet. Flow paths and exploratory choices are kept in memory.
  return { schema: 2, contentVersion: CONTENT_VERSION, id: value.id, createdAt: value.createdAt, institution: value.institution, answers: { ...value.answers }, flows: {}, stra: {} };
}
export function summarizeAnswers(items, answers) {
  const values = items.map(item => ANSWERS.includes(answers[item.id]) ? answers[item.id] : null);
  return { total: values.length, answered: values.filter(Boolean).length, risks: values.filter(v => v === 'risk').length, unknown: values.filter(v => v === 'unknown').length, unanswered: values.filter(v => !v).length };
}
