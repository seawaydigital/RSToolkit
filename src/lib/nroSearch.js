import Fuse from 'fuse.js';
import nroData from '../data/nroData.js';
export function normalizedName(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}
const fuse = new Fuse(nroData.organizations, { keys: ['name', 'aliases'], threshold: 0.3, ignoreLocation: true, includeScore: true });
export function searchOrganizations(query, country = 'all') {
  const text = query.trim();
  const normalized = normalizedName(text);
  const results = text ? fuse.search(text).map(r => ({ organization: r.item, score: r.score })) : nroData.organizations.map(organization => ({ organization, score: 1 }));
  // Ensure punctuation-normalized exact names are available independently of fuzzy ranking.
  const exact = text ? nroData.organizations.filter(o => [o.name, ...o.aliases].some(a => normalizedName(a) === normalized)) : [];
  const combined = [...exact.map(organization => ({ organization, score: -1 })), ...results];
  const seen = new Set();
  return combined.filter(({ organization }) => {
    if (seen.has(organization.id) || (country !== 'all' && organization.country !== country)) return false;
    seen.add(organization.id); return true;
  }).map(({ organization }) => {
    const alias = text ? organization.aliases.find(a => normalizedName(a) === normalized) : null;
    return { organization, label: !text ? 'Official list entry' : normalizedName(organization.name) === normalized ? 'Official name result' : alias ? 'Official alias result' : 'Possible name candidate', alias };
  });
}
