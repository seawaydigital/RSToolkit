import { Component, Suspense, lazy, useMemo } from 'react';
import { searchRecords } from './lib/matcher';
import { COUNTRY_LABELS, INSTITUTION_TYPES, LISTS, RATING_LABELS, RATING_ORDER, SEARCH_PAGE_SIZE as PAGE_SIZE } from './lib/constants';
import { listNotes } from './lib/recordText';
import ListChips from './ListChips';
import RatingBadge from './RatingBadge';

// Leaflet loads only when someone opens the map.
const TrackerMap = lazy(() => import('./TrackerMap'));

// A map that fails to load (offline, say) leaves the list usable.
class MapBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <p className="dit-map-note">The map couldn&apos;t be loaded. The list view shows the same institutions.</p>;
  }
}

const RANK = Object.fromEntries(RATING_ORDER.map((r, i) => [r, i + 1]));
const isVerified = (record) => record.status === 'verified';

const isListed = (record) => record.listings.some((l) => l.status === 'listed');

function defaultOrder(a, b) {
  return (
    (RANK[b.assessment.rating] ?? 0) - (RANK[a.assessment.rating] ?? 0) ||
    Number(a.virtual) - Number(b.virtual) ||
    a.name.localeCompare(b.name)
  );
}

export default function TrackerSearch({ dataset, index, state, setState }) {
  const { query, rating, type, list, country, shown, view } = state;
  const update = (patch) => setState((s) => ({ ...s, shown: PAGE_SIZE, ...patch }));
  const setView = (next) => setState((s) => ({ ...s, view: next }));

  const results = useMemo(() => {
    const base = query.trim()
      ? searchRecords(query, index, { limit: 500 }).map((id) => dataset.byId.get(id)).filter(Boolean)
      : [...dataset.records].sort(defaultOrder);
    return [...new Set(base)].filter(
      (r) =>
        (rating === 'all' || (rating === 'unrated' ? !r.assessment.rating : r.assessment.rating === rating)) &&
        (type === 'all' || (isVerified(r) && r.type === type)) &&
        (country === 'all' || r.country === country) &&
        (list === 'all' || (list === 'any' ? isListed(r) : r.listings.some((l) => l.listId === list && l.status === 'listed'))),
    );
  }, [dataset, index, query, rating, type, list, country]);

  const checked = dataset.lists.map((l) => l.checkedOn).filter(Boolean).sort().at(-1);
  // Only verified records show a type; an unverified one's comes from the
  // seed data, unchecked. A list not loaded yet can't be filtered on.
  const types = [...new Set(dataset.records.filter(isVerified).map((r) => r.type))].sort((a, b) => INSTITUTION_TYPES[a].localeCompare(INSTITUTION_TYPES[b]));
  const pending = new Set(dataset.lists.filter((l) => l.coverage !== 'complete').map((l) => l.listId));

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
        {types.length > 0 && (
          <label>
            <span>Type</span>
            <select value={type} onChange={(e) => update({ type: e.target.value })}>
              <option value="all">Any type</option>
              {types.map((t) => <option key={t} value={t}>{INSTITUTION_TYPES[t]}</option>)}
            </select>
          </label>
        )}
        <label>
          <span>Listed on</span>
          <select value={list} onChange={(e) => update({ list: e.target.value })}>
            <option value="all">Any or none</option>
            <option value="any">At least one list</option>
            {LISTS.map((l) => (
              <option key={l.id} value={l.id} disabled={pending.has(l.id)}>
                {l.jurisdiction}: {l.label}{pending.has(l.id) ? ' (not checked yet)' : ''}
              </option>
            ))}
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

      <div className="dit-results-bar">
        <p className="dit-count" aria-live="polite">
          {results.length === 0
            ? 'No institutions match. Not being in the tracker doesn’t mean low risk.'
            : `${results.length.toLocaleString()} ${results.length === 1 ? 'institution' : 'institutions'}`}
        </p>
        <div className="dit-view-switch dit-no-print" role="group" aria-label="Show results as">
          {[['list', 'List'], ['map', 'Map']].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`dit-view-option${view === value ? ' dit-view-option--active' : ''}`}
              aria-pressed={view === value}
              onClick={() => setView(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'map' ? (
        results.length > 0 && (
          <MapBoundary>
            <Suspense fallback={<p className="dit-map-note">Loading the map…</p>}>
              <TrackerMap records={results} />
            </Suspense>
          </MapBoundary>
        )
      ) : (
        <ListView results={results} shown={shown} onMore={() => setState((s) => ({ ...s, shown: s.shown + PAGE_SIZE }))} />
      )}

      <p className="dit-footnote">Ratings follow the published checklist. Not being listed here doesn&apos;t mean low risk.</p>
    </div>
  );
}

function ListView({ results, shown, onMore }) {
  return (
    <>
      {/* Only the name is the link, so a screen reader hears a short link
          name; the link's ::after stretches it over the whole row. */}
      <ul className="dit-results">
        {results.slice(0, shown).map((r) => {
          const place = [r.location?.city, COUNTRY_LABELS[r.country]].filter(Boolean).join(', ');
          const meta = [r.zh, isVerified(r) ? INSTITUTION_TYPES[r.type] : null, place].filter(Boolean).join(' · ');
          const notes = listNotes(r);
          return (
            <li key={r.id} className="dit-result">
              <div className="dit-result-main">
                <a className="dit-result-name" href={`#defence-tracker/${r.id}`}>{r.name}</a>
                {meta && <p className="dit-result-meta">{meta}</p>}
                <ListChips record={r} />
                {notes.length > 0 && (
                  <ul className="dit-result-notes">
                    {notes.map((n) => <li key={n}>{n}</li>)}
                  </ul>
                )}
              </div>
              <RatingBadge assessment={r.assessment} />
            </li>
          );
        })}
      </ul>
      {results.length > shown && (
        <button type="button" className="dit-button dit-more" onClick={onMore}>
          Show {Math.min(PAGE_SIZE, results.length - shown)} more
        </button>
      )}
    </>
  );
}
