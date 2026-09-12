import { useState } from 'react';
import SourceNote from './SourceNote';
import SupportLinks from './SupportLinks';
import PrintMeta from './PrintMeta';

function Item({ item, onNavigate }) {
  return <><p>{item.text}</p>{item.steps && <ol>{item.steps.map(step => <li key={step}>{step}</li>)}</ol>}
    {item.tool && <button className="guided-cross-link screen-only" onClick={() => onNavigate(item.tool)}>Open related tool</button>}
    <SourceNote ids={item.sourceIds} location={item.location} /></>;
}

export default function ReferenceGuide({ data, onNavigate }) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLocaleLowerCase();
  const sections = data.sections.map(section => ({ ...section, items: section.items.filter(item =>
    (section.title + ' ' + item.title + ' ' + item.text + ' ' + (item.keywords || []).join(' ')).toLocaleLowerCase().includes(normalized)) })).filter(s => s.items.length);
  return <div className="tool-page">
    <header className="tool-page-header"><h1>{data.title}</h1><p>{data.summary}</p><SourceNote ids={data.sourceIds} /></header>
    <div className="screen-only">
      <label htmlFor={'reference-search-' + data.id}>Search this guide</label>
      <input id={'reference-search-' + data.id} className="stra-search" value={query} onChange={event => setQuery(event.target.value)} type="search" />
      <div className="toolbar"><button onClick={() => setQuery('')}>Clear search</button><button onClick={() => window.print()}>Print complete guide</button></div>
      <p role="status">{sections.reduce((n, s) => n + s.items.length, 0)} entries shown. Printing includes the complete guide, regardless of filters or closed sections.</p>
      {sections.map(section => <section key={section.id}><h2 className="reference-section-title">{section.title}</h2>{section.items.map(item =>
        <details className="review-card" key={item.id + (normalized ? '-search' : '-browse')} open={normalized ? true : undefined}><summary>{item.title}</summary><Item item={item} onNavigate={onNavigate} /></details>
      )}</section>)}
      {!sections.length && <p>No entries match. Clear the search to inspect the complete guide; a missing result is not a policy conclusion.</p>}
    </div>
    <div className="print-only"><PrintMeta />{data.sections.map(section => <section key={section.id}><h2>{section.title}</h2>{section.items.map(item => <article key={item.id}><h3>{item.title}</h3><Item item={item} onNavigate={onNavigate} /></article>)}</section>)}</div>
    <SupportLinks />
  </div>;
}
