import { useState } from 'react';
import nroData from '../../data/nroData';
import { searchOrganizations } from '../../lib/nroSearch';
import SourceNote from '../../components/ui/SourceNote';
import SupportLinks from '../../components/ui/SupportLinks';
const countries = [...new Set(nroData.organizations.map(o => o.country))].sort();
export default function NroLookup() {
 const [query, setQuery] = useState('');
 const [country, setCountry] = useState('all');
 const results = searchOrganizations(query, country);
 return <div className="tool-page">
  <header className="tool-page-header"><h1>NRO Lookup</h1><p>Search official organization names and aliases locally in your browser.</p><SourceNote ids={['nro']} /></header>
  <p className="notice">A name result does not establish an affiliation or legal restriction. No result is not clearance. This is a current reference snapshot; for an earlier award, use the list version applicable to the application.</p>
  <div className="lookup-controls">
   <div><label htmlFor="nro-query">Organization name or alias</label><input id="nro-query" className="stra-search" type="search" value={query} onChange={e => setQuery(e.target.value)} /></div>
   <div><label htmlFor="nro-country">Country in the source</label><select id="nro-country" value={country} onChange={e => setCountry(e.target.value)}><option value="all">All countries</option>{countries.map(c => <option key={c}>{c}</option>)}</select></div>
   <button onClick={() => { setQuery(''); setCountry('all'); }}>Clear search and filters</button>
  </div>
  <p role="status">{results.length} of {nroData.organizations.length} official organization entries shown{country !== 'all' ? ' · Filter: ' + country : ''}.</p>
  <p className="scope-note">Aliases appear under their official source entry. The previous 126-row display split out some aliases; this release preserves the source’s 103-entry structure. Country is source context, not a researcher risk rating.</p>
  {!results.length && <p className="notice">No results in this view. Clear filters, try another official spelling and inspect the complete source. Do not infer approval from an empty result.</p>}
  <ul className="organization-list">{results.map(({ organization: org, label, alias }) => <li className="review-card" key={org.id}>
   <h2>{org.name}</h2><p><span className="result-kind">{label}</span> · {org.country}</p>
   {alias && <p>Alias recorded in the source: <strong>{alias}</strong></p>}
   {org.aliases.length > 0 && <details><summary>{org.aliases.length} official aliases / names listed with this entry</summary><ul>{org.aliases.map(a => <li key={a}>{a}</li>)}</ul></details>}
   <a href={nroData.sourceUrl + '#' + org.sourceAnchor} target="_blank" rel="noopener noreferrer">Inspect the official source entry</a>
  </li>)}</ul>
  <SupportLinks />
 </div>;
}
