import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Printer } from 'lucide-react';
import { BADGES, dueDiligenceSourcesData as data } from '../../data/dueDiligenceSourcesData';
import { TRACKER_ENABLED } from '../../data/defenceTracker/enabled';
import { SCREENING_ENABLED } from '../compliance/screening/enabled';

const FLAGS = { tracker: TRACKER_ENABLED, screening: SCREENING_ENABLED };
const SOURCES = Object.fromEntries(data.sources.map((s) => [s.id, s]));
const cardId = (id) => `dds-src-${id}`;

function ExternalLinkText({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function SourceCard({ source, open, onToggle }) {
  const bodyId = `${cardId(source.id)}-body`;
  return (
    <section className="dds-card" id={cardId(source.id)} aria-labelledby={`${cardId(source.id)}-title`}>
      <h3 className="dds-card-heading" id={`${cardId(source.id)}-title`}>
        <button type="button" className="dds-card-toggle" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
          {open ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
          <span className="dds-card-name">{source.name}</span>
          <span className={`dds-badge dds-badge--${source.badge}`}>{BADGES[source.badge]}</span>
        </button>
      </h3>
      <div className="dds-card-body" id={bodyId} hidden={!open}>
        <p className="dds-runby">Run by {source.runBy}</p>
        <p>{source.whatItIs}</p>
        {source.caution && (
          <p className="dds-caution">
            This source is about individual people. Check institutions first, and look up a person only as far as the decision
            needs.
          </p>
        )}
        <div className="dds-columns">
          <div>
            <h4>Good for</h4>
            <ul>
              {source.goodFor.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Can&apos;t tell you</h4>
            <ul>
              {source.cantTell.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <h4>Reading a result</h4>
        <p className="dds-example">
          <span className="dds-example-label">Example, with made-up names: </span>
          {source.reading}
        </p>
        <dl className="dds-facts">
          <dt>Cost and access</dt>
          <dd>{source.access}</dd>
          <dt>Reusing what you find</dt>
          <dd>{source.licence}</dd>
          <dt>What searching it tells others</dt>
          <dd>{source.reveals}</dd>
        </dl>
        <p className="dds-card-links">
          <ExternalLinkText href={source.url}>Open {source.name}</ExternalLinkText>
          <span className="dds-checked">
            Facts checked {source.checked.date} against <ExternalLinkText href={source.checked.url}>the source&apos;s own page</ExternalLinkText>
          </span>
        </p>
      </div>
    </section>
  );
}

export default function DueDiligenceSources() {
  const [open, setOpen] = useState({});
  const [copyStatus, setCopyStatus] = useState('');

  const allOpen = data.sources.every((s) => open[s.id]);
  const setAll = (value) => setOpen(Object.fromEntries(data.sources.map((s) => [s.id, value])));

  // From the question table: open the card and move focus to its toggle, so
  // keyboard and screen-reader users land on it. Cards are always mounted
  // (a closed one only hides its body), so the toggle is already there.
  function goToSource(id) {
    setOpen((o) => ({ ...o, [id]: true }));
    const card = document.getElementById(cardId(id));
    card?.scrollIntoView({ block: 'start' });
    card?.querySelector('.dds-card-toggle')?.focus();
  }

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(data.logTemplate);
      setCopyStatus('Template copied.');
    } catch {
      setCopyStatus('Your browser blocked copying. Select the text and copy it instead.');
    }
  }

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Due Diligence Sources</h1>
        <p>
          A plain-language guide to the open sources people use to check a research partner: what each one is, what it can and
          can&apos;t tell you, and how to read what it finds.
        </p>
        <div className="tool-page-meta">
          <span>Last updated: {data.lastUpdated}</span>
        </div>
      </div>

      <p className="dds-intro">
        Start with the official lists and your institution&apos;s research security office. The other sources here help you find
        things; none of them clears anyone, and nothing on this page is legal advice. This page only links to these sources: it
        never sends what you are looking up anywhere.
      </p>

      <h2 className="dds-heading">Which source answers my question?</h2>
      <div className="dds-table-wrap">
        <table className="dds-table">
          <thead>
            <tr>
              <th scope="col">Your question</th>
              <th scope="col">Where to look</th>
              <th scope="col">On this site</th>
            </tr>
          </thead>
          <tbody>
            {data.questions.map((q) => {
              const tools = q.tools.filter((t) => !t.flag || FLAGS[t.flag]);
              return (
                <tr key={q.id}>
                  <th scope="row">
                    {q.question}
                    {q.note && <span className="dds-note">{q.note}</span>}
                  </th>
                  <td>
                    <ul className="dds-inline-list">
                      {q.sources.map((id) => (
                        <li key={id}>
                          <button type="button" className="dds-link-button" onClick={() => goToSource(id)}>
                            {SOURCES[id].name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {tools.length ? (
                      <ul className="dds-inline-list">
                        {tools.map((t) => (
                          <li key={t.slug}>
                            <a href={`#${t.slug}`}>{t.label}</a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="dds-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="dds-sources-head">
        <h2 className="dds-heading">The sources</h2>
        <div className="dds-actions dds-no-print">
          <button type="button" className="dds-button" onClick={() => setAll(!allOpen)}>
            {allOpen ? 'Close all' : 'Open all'}
          </button>
          <button type="button" className="dds-button" onClick={() => window.print()}>
            <Printer size={15} aria-hidden="true" /> Print
          </button>
        </div>
      </div>
      {data.sources.map((s) => (
        <SourceCard key={s.id} source={s} open={!!open[s.id]} onToggle={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))} />
      ))}
      <p className="dds-note dds-paid">{data.paidNote}</p>

      <h2 className="dds-heading">Reading any result</h2>
      <ol className="dds-rules">
        {data.rules.map((r) => (
          <li key={r.title}>
            <strong>{r.title}</strong> {r.text}
          </li>
        ))}
      </ol>

      <h2 className="dds-heading">Keep a record</h2>
      <p className="dds-help">
        Write down each search as you do it, in a line like this one. It shows later what was checked, when, and what was found,
        including when nothing was found.
      </p>
      <p className="dds-template">{data.logTemplate}</p>
      <div className="dds-actions dds-no-print">
        <button type="button" className="dds-button" onClick={copyTemplate}>
          <Copy size={15} aria-hidden="true" /> Copy the template
        </button>
        <span className="dds-status" aria-live="polite">
          {copyStatus}
        </span>
      </div>
      <p className="dds-help">
        Not sure what a result means for your project? <a href="#report-concern">Report a Concern</a> says who to contact,
        starting with your own institution.
      </p>
    </div>
  );
}

