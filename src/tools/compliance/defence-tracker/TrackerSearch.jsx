import { useMemo } from 'react';
import { searchRecords } from './lib/matcher';
import { COUNTRY_LABELS, INSTITUTION_TYPES, LISTS, LIST_SHORT_LABELS, RATING_LABELS, RATING_ORDER, SEARCH_PAGE_SIZE as PAGE_SIZE } from './lib/constants';
import RatingBadge from './RatingBadge';

const RANK = Object.fromEntries(RATING_ORDER.map((r, i) => [r, i + 1]));

const listedOn = (record) => record.listings.filter((l) => l.status === 'listed').map((l) => LIST_SHORT_LABELS[l.listId]);

function defaultOrder(a, b) {
  return (
    (RANK[b.assessment.rating] ?? 0) - (RANK[a.assessment.rating] ?? 0) ||
    Number(a.virtual) - Number(b.virtual) ||
    a.name.localeCompare(b.name)
  );
}

export default function TrackerSearch({ dataset, index, state, setState }) {
  const { query, rating, type, list, country, shown } = state;
  const update = (patch) => setState((s) => ({ ...s, shown: PAGE_SIZE, ...patch }));

  const results = useMemo(() => {
    const base = query.trim()
      ? searchRecords(query, index, { limit: 500 }).map((id) => dataset.byId.get(id)).filter(Boolean)
      : [...dataset.records].sort(defaultOrder);
    return [...new Set(base)].filter(
      (r) =>
        (rating === 'all' || (rating === 'unrated' ? !r.assessment.rating : r.assessment.rating === rating)) &&
        (type === 'all' || r.type === type) &&
        (country === 'all' || r.country === country) &&
        (list === 'all' || (list === 'any' ? listedOn(r).length > 0 : r.listings.some((l) => l.listId === list && l.status === 'listed'))),
    );
  }, [dataset, index, query, rating, type, list, country]);

  const checked = dataset.lists.map((l) => l.checkedOn).filter(Boolean).sort().at(-1);
  const types = [...new Set(dataset.records.map((r) => r.type))].sort((a, b) => INSTITUTION_TYPES[a].localeCompare(INSTITUTION_TYPES[b]));

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Defence Institution Tracker</h1>
        <p>
          Chinese, Russian and Iranian research institutions with military or security ties: sourced ratings, the official lists
          each one appears on, and a batch check for partner and co-author lists.
        </p>
        <div className="tool-page-meta">
          <span>Dataset {dataset.meta.version}</span>
          <span>{dataset.records.length.toLocaleString()} institutions</span>
          {checked && <span>Lists checked {checked}</span>}
          <a href="#defence-tracker/methodology">How ratings work</a>
        </div>
      </div>

      <div className="dit-toolbar dit-no-print">
        <a className="dit-button dit-button--primary" href="#defence-tracker/batch">Batch check</a>
        <a className="dit-button" href="#defence-tracker/methodology">Methodology and data downloads</a>
      </div>

      <p className="dit-intro">
        Information here is about institutions, never individuals. A rating describes an institution&apos;s documented military
        and security ties; it says nothing about the intentions of anyone who works or studies there. This is not legal advice,
        and the official lists prevail.
      </p>

      <label className="dit-label" htmlFor="dit-query">Search by name, Chinese name, acronym or email domain</label>
      <input
        id="dit-query"
        type="search"
        className="dit-search dit-no-print"
        value={query}
        autoComplete="off"
        spellCheck={false}
        placeholder="Harbin Institute of Technology, 哈尔滨工业大学, HIT or hit.edu.cn"
        onChange={(e) => update({ query: e.target.value })}
      />

      <div className="dit-filters dit-no-print">
        <label>
          <span>Rating</span>
          <select value={rating} onChange={(e) => update({ rating: e.target.value })}>
            <option value="all">Any rating</option>
            {[...RATING_ORDER].reverse().map((r) => <option key={r} value={r}>{RATING_LABELS[r]}</option>)}
            <option value="unrated">Not yet rated</option>
          </select>
        </label>
        <label>
          <span>Type</span>
          <select value={type} onChange={(e) => update({ type: e.target.value })}>
            <option value="all">Any type</option>
            {types.map((t) => <option key={t} value={t}>{INSTITUTION_TYPES[t]}</option>)}
          </select>
        </label>
        <label>
          <span>Listed on</span>
          <select value={list} onChange={(e) => update({ list: e.target.value })}>
            <option value="all">Any or none</option>
            <option value="any">At least one list</option>
            {LISTS.map((l) => <option key={l.id} value={l.id}>{l.jurisdiction}: {l.label}</option>)}
          </select>
        </label>
        <label>
          <span>Country</span>
          <select value={country} onChange={(e) => update({ country: e.target.value })}>
            <option value="all">Any country</option>
            {Object.entries(COUNTRY_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        </label>
      </div>

      <p className="dit-count" aria-live="polite">
        {results.length === 0
          ? 'No institutions match. Not being in the tracker doesn’t mean low risk.'
          : `${results.length.toLocaleString()} ${results.length === 1 ? 'institution' : 'institutions'}`}
      </p>

      <ul className="dit-results">
        {results.slice(0, shown).map((r) => {
          const lists = listedOn(r);
          const place = [r.location?.city, COUNTRY_LABELS[r.country]].filter(Boolean).join(', ');
          return (
            <li key={r.id}>
              <a className="dit-result" href={`#defence-tracker/${r.id}`}>
                <span className="dit-result-main">
                  <span className="dit-result-name">{r.name}</span>
                  <span className="dit-result-meta">
                    {[r.zh, INSTITUTION_TYPES[r.type], place, lists.length ? lists.join(' · ') : 'Not on a checked list'].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <RatingBadge assessment={r.assessment} />
              </a>
            </li>
          );
        })}
      </ul>
      {results.length > shown && (
        <button type="button" className="dit-button dit-more" onClick={() => setState((s) => ({ ...s, shown: s.shown + PAGE_SIZE }))}>
          Show {Math.min(PAGE_SIZE, results.length - shown)} more
        </button>
      )}

      <p className="dit-footnote">Ratings follow the published checklist. Not being listed here doesn&apos;t mean low risk.</p>
    </div>
  );
}
