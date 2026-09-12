import { useState } from 'react';
import Fuse from 'fuse.js';
import { straData } from '../../data/straData';
import SourceNote from '../../components/ui/SourceNote';
import SupportLinks from '../../components/ui/SupportLinks';
import { useAssessment } from '../../state/useAssessment';
const items = straData.categories.flatMap(c => c.subcategories.map(s => ({ ...s, category: c.id, categoryName: c.name })));
const fuse = new Fuse(items, { keys: ['name', 'description', 'keywords', 'categoryName'], threshold: 0.35, ignoreLocation: true });
export default function StraLookup() {
 const [query, setQuery] = useState('');
 const { state, update } = useAssessment();
 const selected = state.stra.category || 'all';
 const resultIds = query.trim() ? new Set(fuse.search(query.trim()).map(r => r.item.id)) : null;
 const categories = straData.categories.filter(c => selected === 'all' || selected === c.id).map(c => ({ ...c, subcategories: c.subcategories.filter(s => !resultIds || resultIds.has(s.id)) })).filter(c => c.subcategories.length);
 function choose(patch) { update({ stra: { ...state.stra, ...patch } }); }
 return <div className="tool-page">
  <header className="tool-page-header"><h1>STRA Category Explorer</h1><p>Find official subcategories and record your own assessment. This explorer does not classify research or estimate risk.</p><SourceNote ids={['stra', 'stracFaq']} /></header>
  <div className="notice"><p>Consider whether the funded work advances a listed technology, including fundamental or multidisciplinary research. Merely using a technology is not automatically advancement. No keyword result does not mean your work is outside the policy.</p></div>
  <label htmlFor="stra-theme">Choose a technology theme to inspect</label>
  <select id="stra-theme" value={selected} onChange={e => choose({ category: e.target.value })}><option value="all">All categories</option>{straData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
  <label htmlFor="stra-query">Search names, descriptions and keyword aids</label>
  <input id="stra-query" className="stra-search" type="search" value={query} onChange={e => setQuery(e.target.value)} />
  <button onClick={() => { setQuery(''); choose({ category: 'all' }); }}>Show the complete list</button>
  <p role="status">{categories.length} categories shown. Keywords and concise descriptions are navigation aids; consult the official definitions.</p>
  {categories.map(category => <section className="review-card" key={category.id}><h2>{category.name}</h2><p>{category.description}</p>
   {category.subcategories.map(sub => <details key={sub.id}><summary>{sub.name}</summary>{sub.kind === 'category-overview' && <p>The official list describes this category without named subcategories.</p>}<p>{sub.description}</p><p className="scope-note">Search aids: {sub.keywords.join(', ')}</p></details>)}
  </section>)}
  {!categories.length && <p className="notice">No results in this view. Inspect the complete list before drawing a conclusion.</p>}
  <fieldset className="review-card"><legend>Your assessment after reading the official definitions</legend>
   {[['advances', 'I believe the work advances a listed subcategory'], ['does-not-advance', 'I believe the work does not advance a listed subcategory'], ['unknown', 'Not sure; more information is needed']].map(([value, label]) => <label className="choice-label" key={value}><input type="radio" name="stra-assessment" value={value} checked={state.stra.assessment === value} onChange={() => choose({ assessment: value })} />{label}</label>)}
   <p>This is your recorded view, kept temporarily in this page. It is not an automated classification and is not applied to a funding walkthrough without your answers there.</p>
  </fieldset><SupportLinks />
 </div>;
}
