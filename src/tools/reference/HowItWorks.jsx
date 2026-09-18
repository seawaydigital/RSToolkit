import { useState } from 'react';
import { howItWorksData as data, STORAGE_KEYS } from '../../data/howItWorksData';

// A plain-language explanation of the site's architecture and what it means
// for a researcher's data. Deliberately a single scrolling page rather than
// tabs: a sceptical reader (or an IT reviewer) should be able to read it top
// to bottom, and print it, without hunting through panels.

function CrossLink({ slug, label, onNavigate }) {
  return (
    <button type="button" className="hiw-crosslink" onClick={() => onNavigate?.(slug)}>
      {label} →
    </button>
  );
}

export default function HowItWorks({ onNavigate }) {
  const [cleared, setCleared] = useState(false);

  function clearSavedData() {
    try {
      STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      // localStorage unavailable — there is nothing to clear
    }
    setCleared(true);
  }

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>How This Site Works &amp; Why It Is Safe to Use</h1>
        <p>{data.intro}</p>
        <div className="tool-page-meta">
          <span>Last updated: {data.lastUpdated}</span>
          <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">
            {data.sourceLabel}
          </a>
        </div>
      </div>

      {/* The one thing to take away, above everything else. */}
      <section className="hiw-headline">
        <h2 className="hiw-headline-title">{data.headline.title}</h2>
        <p>{data.headline.body}</p>
      </section>

      <h2 className="hiw-section-title">{data.steps.title}</h2>
      <ol className="hiw-steps">
        {data.steps.items.map((s, i) => (
          <li key={s.title} className="hiw-step">
            <span className="hiw-step-num" aria-hidden="true">{i + 1}</span>
            <div>
              <h3 className="hiw-step-title">{s.title}</h3>
              <p className="hiw-step-body">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="hiw-section-title">{data.dataFlows.title}</h2>
      <p className="hiw-lead">{data.dataFlows.intro}</p>
      <div className="hiw-table-wrap">
        <table className="hiw-table">
          <thead>
            <tr>
              {data.dataFlows.columns.map((c) => (
                <th key={c} scope="col">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.dataFlows.rows.map((r) => (
              <tr key={r.when + r.to} className={r.highlight ? 'hiw-row--highlight' : undefined}>
                <th scope="row">{r.when}</th>
                <td>{r.what}</td>
                <td>{r.to}</td>
                <td>{r.learn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hiw-outro">{data.dataFlows.outro}</p>

      <h2 className="hiw-section-title">{data.storage.title}</h2>
      <p className="hiw-lead">{data.storage.body}</p>
      <ul className="hiw-storage-list">
        {data.storage.items.map((s) => (
          <li key={s.slug}>
            <CrossLink slug={s.slug} label={s.tool} onNavigate={onNavigate} />
            <span className="hiw-storage-what"> — {s.what}</span>
          </li>
        ))}
      </ul>
      <div className="hiw-clear">
        <p className="hiw-clear-caution">{data.storage.caution}</p>
        <button type="button" className="hiw-clear-btn" onClick={clearSavedData}>
          {data.storage.clearButton}
        </button>
        <p className="hiw-clear-status" role="status" aria-live="polite">
          {cleared ? data.storage.clearedMessage : ''}
        </p>
      </div>

      <h2 className="hiw-section-title">{data.comparison.title}</h2>
      <p className="hiw-lead">{data.comparison.intro}</p>
      <div className="hiw-table-wrap">
        <table className="hiw-table hiw-table--compare">
          <thead>
            <tr>
              {data.comparison.columns.map((c) => (
                <th key={c} scope="col">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.comparison.rows.map((r) => (
              <tr key={r.option} className={r.self ? 'hiw-row--self' : undefined}>
                <th scope="row">{r.option}</th>
                <td>{r.where}</td>
                <td>
                  {r.risk}
                  {r.crossLink && (
                    <>
                      {' '}
                      <CrossLink slug={r.crossLink} label="Open the guide" onNavigate={onNavigate} />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="hiw-section-title">{data.safeguards.title}</h2>
      <p className="hiw-lead">{data.safeguards.intro}</p>
      <ul className="hiw-safeguards">
        {data.safeguards.items.map((s) => (
          <li key={s.title} className="hiw-safeguard">
            <h3 className="hiw-safeguard-title">{s.title}</h3>
            <p className="hiw-safeguard-body">{s.body}</p>
          </li>
        ))}
      </ul>

      <h2 className="hiw-section-title">{data.verify.title}</h2>
      <p className="hiw-lead">{data.verify.intro}</p>
      <ol className="hiw-steps">
        {data.verify.items.map((s, i) => (
          <li key={s.title} className="hiw-step">
            <span className="hiw-step-num" aria-hidden="true">{i + 1}</span>
            <div>
              <h3 className="hiw-step-title">{s.title}</h3>
              <p className="hiw-step-body">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="hiw-limits">
        <h2 className="hiw-limits-title">{data.limits.title}</h2>
        <ul className="hiw-limits-list">
          {data.limits.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="hiw-limits-links">
          <CrossLink slug="cybersecurity-guide" label="Cybersecurity Best Practices" onNavigate={onNavigate} />
          <CrossLink slug="faq" label="Research Security FAQ" onNavigate={onNavigate} />
        </p>
      </section>
    </div>
  );
}
