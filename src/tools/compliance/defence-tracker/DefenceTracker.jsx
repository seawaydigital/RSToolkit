import { Component, useEffect, useState } from 'react';
import { getTrackerData } from '../../../data/defenceTracker';
import { resolveTrackerView } from './lib/views';
import { SEARCH_PAGE_SIZE } from './lib/constants';
import TrackerSearch from './TrackerSearch';
import InstitutionProfile from './InstitutionProfile';
import BatchCheck from './BatchCheck';
import TrackerMethodology from './TrackerMethodology';

const VIEW_TITLES = { batch: 'Batch check', methodology: 'Methodology', 'not-found': 'Not found' };
const INITIAL_SEARCH_STATE = { query: '', rating: 'all', type: 'all', list: 'all', country: 'all', shown: SEARCH_PAGE_SIZE, view: 'list' };

// Keeps one broken record from taking down the whole tracker; reset when the
// sub-route changes.
class ViewBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="tool-page">
        <h1 className="dit-title">This page couldn&apos;t be shown</h1>
        <p>Something in this record could not be displayed. Please report it so it can be fixed.</p>
        <a className="dit-button" href="#defence-tracker">Back to search</a>
      </div>
    );
  }
}

function NotFound() {
  return (
    <div className="tool-page">
      <h1 className="dit-title">Institution not found</h1>
      <p>
        There is no tracker record at this address. Permanent links never change, so check the link for typos, or search for the
        institution by name.
      </p>
      <a className="dit-button" href="#defence-tracker">Search the tracker</a>
    </div>
  );
}

// The search and batch state live here, in memory only, so moving between
// tracker views keeps a pasted list and a search. Nothing is ever stored.
export default function DefenceTracker({ onNavigate, subRoute, onPageTitle }) {
  const { dataset, index, changelog } = getTrackerData();
  const view = resolveTrackerView(subRoute, (id) => dataset.byId.has(id));
  const [search, setSearch] = useState(INITIAL_SEARCH_STATE);
  const [batch, setBatch] = useState({ text: '', result: null, checkedOn: null });

  useEffect(() => {
    if (view.view !== 'profile') onPageTitle?.(VIEW_TITLES[view.view] ?? null);
  }, [view.view, onPageTitle]);
  useEffect(() => () => onPageTitle?.(null), [onPageTitle]);

  let content;
  if (view.view === 'profile') {
    content = <InstitutionProfile record={dataset.byId.get(view.id)} dataset={dataset} onNavigate={onNavigate} onPageTitle={onPageTitle} />;
  } else if (view.view === 'batch') {
    content = <BatchCheck dataset={dataset} index={index} state={batch} setState={setBatch} />;
  } else if (view.view === 'methodology') {
    content = <TrackerMethodology dataset={dataset} changelog={changelog} />;
  } else if (view.view === 'not-found') {
    content = <NotFound />;
  } else {
    content = <TrackerSearch dataset={dataset} index={index} state={search} setState={setSearch} />;
  }
  return <ViewBoundary key={subRoute ?? 'invalid'}>{content}</ViewBoundary>;
}
