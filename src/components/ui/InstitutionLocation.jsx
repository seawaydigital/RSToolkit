import { useEffect, useRef, useState } from 'react';
import { searchPublicPlaces, validCoordinates } from '../../lib/geography';

export default function InstitutionLocation({ onSelect, onClear, selected }) {
 const [online, setOnline] = useState(false);
 const [query, setQuery] = useState('');
 const [results, setResults] = useState([]);
 const [candidate, setCandidate] = useState(null);
 const [status, setStatus] = useState('');
 const [busy, setBusy] = useState(false);
 const [manual, setManual] = useState({ label: '', lat: '', lng: '' });
 const request = useRef(null);
 const lastRequest = useRef(0);
 useEffect(() => () => request.current?.abort(), []);
 function revoke() {
  request.current?.abort(); request.current = null;
  setOnline(false); setQuery(''); setResults([]); setCandidate(null); setBusy(false); setStatus('External search is off.');
 }
 function changeQuery(value) {
  request.current?.abort(); request.current = null;
  setBusy(false); setQuery(value); setResults([]); setCandidate(null); setStatus('');
 }
 async function search(event) {
  event.preventDefault();
  if (!online || busy) return;
  if (Date.now() - lastRequest.current < 1200) { setStatus('Please wait a moment before another search.'); return; }
  lastRequest.current = Date.now();
  const controller = new AbortController(); request.current = controller;
  const timeout = setTimeout(() => controller.abort(), 15000);
  setBusy(true); setCandidate(null); setResults([]); setStatus('Searching public place records…');
  try {
   const places = await searchPublicPlaces(query, controller.signal);
   if (request.current !== controller) return;
   setResults(places);
   setStatus(places.length ? 'Choose a result and check that it represents the intended campus or building.' : 'No usable location was returned. This is not an NRO screening result. Try another name or enter coordinates locally.');
  } catch (error) {
   if (request.current === controller) setStatus(error.name === 'AbortError' ? 'Search timed out or was cancelled. Enter coordinates locally or try later.' : error.message);
  } finally { clearTimeout(timeout); if (request.current === controller) { request.current = null; setBusy(false); } }
 }
 function manualLocation(event) {
  event.preventDefault();
  const lat = Number(manual.lat), lng = Number(manual.lng);
  if (!manual.label.trim() || !manual.lat.trim() || !manual.lng.trim() || !validCoordinates(lat, lng)) {
   setStatus('Enter a public campus label and valid latitude (−85 to 85) and longitude (−180 to 180).'); return;
  }
  setCandidate({ id: 'manual', label: manual.label.trim(), lat, lng, sourceLabel: 'Coordinates entered by you', scope: 'User-supplied point; not verified by this toolkit.' });
  setStatus('Review this point before using it.');
 }
 return <section className="review-card location-controls" aria-labelledby="institution-location-heading">
  <h3 id="institution-location-heading">Compare an institution or campus</h3>
  <p>Choose the actual campus or building you want to compare. Your location and queries stay out of worksheet storage and page URLs.</p>
  <details><summary>Enter coordinates locally</summary><p>Use public institution coordinates from a source you have checked. Nothing entered here is sent to a location service.</p>
   <form onSubmit={manualLocation} className="location-form">
    <div><label htmlFor="campus-label">Public campus or building name</label><input id="campus-label" value={manual.label} maxLength={160} onChange={e => setManual({ ...manual, label: e.target.value })} required /></div>
    <div><label htmlFor="campus-lat">Latitude</label><input id="campus-lat" inputMode="decimal" value={manual.lat} onChange={e => setManual({ ...manual, lat: e.target.value })} placeholder="48.4200" required /></div>
    <div><label htmlFor="campus-lng">Longitude</label><input id="campus-lng" inputMode="decimal" value={manual.lng} onChange={e => setManual({ ...manual, lng: e.target.value })} placeholder="-89.2622" required /></div>
    <button type="submit">Review these coordinates</button>
   </form>
  </details>
  <details><summary>Search for a public institution online</summary>
   <p>Optional: Wikipedia receives the public institution or campus name you submit and your connection information. Results can describe a main campus, another campus, or an unrelated place. Do not enter researcher names or confidential project details. <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy" target="_blank" rel="noopener noreferrer">Wikimedia privacy policy</a>.</p>
   <label className="choice-label"><input type="checkbox" checked={online} onChange={e => e.target.checked ? setOnline(true) : revoke()} />Allow public-place searches through Wikipedia for this visit</label>
   {online && <form onSubmit={search}>
    <label htmlFor="public-place-query">Public institution or campus to find</label><input type="search" id="public-place-query" value={query} minLength={3} maxLength={160} onChange={e => changeQuery(e.target.value)} required />
    <button type="submit" disabled={busy}>{busy ? 'Searching…' : 'Search Wikipedia locations'}</button>
   </form>}
   {results.length > 0 && <fieldset><legend>Possible locations. Select the intended site.</legend>{results.map(place => <label className="choice-label" key={place.id}><input type="radio" name="public-place" checked={candidate?.id === place.id} onChange={() => setCandidate(place)} />{place.label} ({place.lat.toFixed(4)}, {place.lng.toFixed(4)})</label>)}</fieldset>}
  </details>
  <p role="status">{status}</p>
  {candidate && <div className="location-confirmation">
   <h4>Confirm this location</h4><p><strong>{candidate.label}</strong> · {candidate.lat.toFixed(5)}, {candidate.lng.toFixed(5)}</p><p>{candidate.scope}</p>
   {candidate.sourceUrl && <p><a href={candidate.sourceUrl} target="_blank" rel="noopener noreferrer">Check the location source</a></p>}
   <button onClick={() => { onSelect(candidate); setCandidate(null); setStatus('Comparison location selected. Distances are approximate and cover mapped NRO sites only.'); }}>Use this campus or location</button>
  </div>}
  {selected && <p>Comparing: <strong>{selected.label}</strong>. <button onClick={() => { onClear(); setCandidate(null); }}>Clear comparison location</button></p>}
 </section>;
}
