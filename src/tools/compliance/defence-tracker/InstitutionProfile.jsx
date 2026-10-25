import { useEffect, useState } from 'react';
import { Copy, Flag, Printer } from 'lucide-react';
import { INSTITUTION_RS_CONTACT, SITE_URL } from '../../../siteConfig';
import { howItWorksData } from '../../../data/howItWorksData';
import { straData } from '../../../data/straData';
import { ANNEX_B, COUNTRY_LABELS, INSTITUTION_TYPES, RATING_LABELS, SIGNALS } from './lib/constants';
import { formatRecordForFile, profilePath, sanctionsNotes } from './lib/recordText';
import RatingBadge from './RatingBadge';
import TrackerSection from './TrackerSection';

const STATUS_TEXT = { listed: 'Listed', 'not-listed': 'Not listed', 'not-checked': 'Not checked yet' };

const STRA_NAMES = Object.fromEntries(
  straData.categories.flatMap((c) => [[c.id, c.name], ...(c.subcategories ?? []).map((s) => [s.id, `${s.name} (${c.name})`])]),
);

const today = () => new Date().toLocaleDateString('en-CA');

function ListingDetails({ listing, recordName }) {
  if (listing.status !== 'listed') return null;
  return (
    <ul className="dit-listing-entries">
      {listing.entries.map((e, i) => (
        <li key={e.key ?? i}>
          {e.name && e.name.toLowerCase() !== recordName.toLowerCase() && <span>Listed as “{e.name}”. </span>}
          {[e.date && `Since ${e.date}`, e.citation].filter(Boolean).join(' · ')}
          {e.url && (
            <>
              {' '}
              <a href={e.url} target="_blank" rel="noopener noreferrer">Source</a>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

const hasDetails = (record, verified, labs) =>
  (verified && (labs.length > 0 || record.topics.length > 0 || record.subunits.length > 0)) ||
  record.aliases.length + record.zhAliases.length + record.sources.length + record.history.length > 0;

function SourceCite({ ids, numbers }) {
  const cited = ids.map((id) => numbers.get(id)).filter(Boolean);
  if (!cited.length) return null;
  return <span className="dit-cite"> [{cited.join(', ')}]</span>;
}

export default function InstitutionProfile({ record, dataset, onPageTitle }) {
  const [status, setStatus] = useState('');
  const [fallbackText, setFallbackText] = useState(null);
  const a = record.assessment;
  const verified = record.status === 'verified';
  const permalink = `${SITE_URL}/${profilePath(record.id)}`;
  const sourceNumbers = new Map(record.sources.map((s, i) => [s.id, i + 1]));
  const notes = sanctionsNotes(record);
  const place = [record.location?.city, record.location?.province, COUNTRY_LABELS[record.country]].filter(Boolean).join(', ');

  useEffect(() => {
    onPageTitle?.(record.name);
  }, [record.name, onPageTitle]);

  async function copyRecord() {
    const text = formatRecordForFile(record, { meta: dataset.meta, permalink, retrievedOn: today() });
    try {
      await navigator.clipboard.writeText(text);
      setFallbackText(null);
      setStatus('Record copied. Paste it into your file.');
    } catch {
      setFallbackText(text);
      setStatus('Your browser blocked copying. Select the text below and copy it.');
    }
  }

  const subject = encodeURIComponent(`Tracker correction: ${record.name} (${record.id})`);
  // Issue forms prefill a field from a query parameter named after its id.
  const issueUrl = `${howItWorksData.sourceUrl}/issues/new?template=tracker-correction.yml&title=${subject}&institution=${encodeURIComponent(`${record.name} (#defence-tracker/${record.id})`)}`;
  const byQuestion = Object.keys(ANNEX_B).map((q) => [q, record.evidence.filter((e) => e.annexB?.includes(q))]);
  const labs = record.evidence.filter((e) => e.signal === 'defence-key-labs');

  return (
    <div className="tool-page dit-profile">
      <p className="dit-breadcrumb dit-no-print">
        <a href="#defence-tracker">Defence Institution Tracker</a> <span aria-hidden="true">›</span> {record.name}
      </p>

      <div className="dit-profile-header">
        <div className="dit-profile-names">
          <h1 className="dit-title">{record.name}</h1>
          <p className="dit-subline">
            {[record.zh, record.acronyms.join(', '), record.domains.join(', '), place].filter(Boolean).join(' · ')}
          </p>
          <p className="dit-subline dit-subline--muted">
            {[INSTITUTION_TYPES[record.type], verified && record.supervisors.length ? `Supervised by ${record.supervisors.join(', ')}` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="dit-rating-box">
          <RatingBadge assessment={a} large />
          <p className="dit-rating-date">
            {verified ? `Verified ${record.verifiedOn}` : 'Not yet verified'} · dataset {dataset.meta.version}
          </p>
        </div>
      </div>

      <div className="dit-actions dit-no-print">
        <button type="button" className="dit-button dit-button--primary" onClick={copyRecord}>
          <Copy size={15} aria-hidden="true" /> Copy record for file
        </button>
        <button type="button" className="dit-button" onClick={() => window.print()}>
          <Printer size={15} aria-hidden="true" /> Print
        </button>
        <a className="dit-button" href={`mailto:${INSTITUTION_RS_CONTACT.email}?subject=${subject}`}>
          <Flag size={15} aria-hidden="true" /> Report an error
        </a>
        <a className="dit-text-link" href={issueUrl} target="_blank" rel="noopener noreferrer">or open a GitHub issue</a>
      </div>
      <p className="dit-status" aria-live="polite">{status}</p>
      {fallbackText && (
        <textarea className="dit-copy-fallback" readOnly rows={10} value={fallbackText} aria-label="Record text to copy" onFocus={(e) => e.target.select()} />
      )}

      {!verified && (
        <p className="dit-banner" role="note">
          <strong>Profile under review.</strong> This institution has not been verified yet, so it is not rated. The official listings
          below are checked automatically.
        </p>
      )}
      {notes.map((n) => (
        <p key={n} className="dit-banner dit-banner--sanctions" role="note">{n}</p>
      ))}

      <h2 className="dit-heading">Formal listings</h2>
      <div className="dit-table-wrap">
        <table className="dit-table">
          <thead>
            <tr>
              <th scope="col">List</th>
              <th scope="col">Status</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {record.listings.map((l) => (
              <tr key={l.listId}>
                <th scope="row">
                  {l.label}
                  <span className="dit-table-sub">{l.jurisdiction}</span>
                </th>
                <td className={`dit-status-cell dit-status-cell--${l.status}`}>{STATUS_TEXT[l.status]}</td>
                <td>
                  <ListingDetails listing={l} recordName={record.name} />
                  {l.listId === 'ca-nro' && l.status === 'listed' && (
                    <p className="dit-table-note">A current affiliation makes a STRAC-covered grant application ineligible.</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {verified && (
        <>
          <h2 className="dit-heading">Why this rating</h2>
          <div className="dit-why">
            <p>
              <strong>{RATING_LABELS[a.baseRating]}:</strong> {a.ruleText}
            </p>
            {a.reasons.length > 0 && (
              <ul>
                {a.reasons.map((r) => (
                  <li key={r.signal ?? r.listId}>{r.label}</li>
                ))}
              </ul>
            )}
            {a.overridden && (
              <p>
                <strong>Adjusted to {RATING_LABELS[a.rating]}:</strong> {a.overrideReason}
              </p>
            )}
            <p className="dit-why-link">
              <a href="#defence-tracker/methodology">How ratings work</a>
            </p>
          </div>

          <h2 className="dit-heading">Evidence for your NSGRP form (Annex B)</h2>
          {byQuestion.map(([q, items]) => (
            <TrackerSection key={q} title={`${q} ${ANNEX_B[q]}`} count={items.length}>
              {items.length ? (
                <ul className="dit-evidence">
                  {items.map((e, i) => (
                    <li key={`${e.signal}-${i}`}>
                      <strong>{SIGNALS[e.signal]?.label ?? e.signal}.</strong> {e.summary}
                      <SourceCite ids={e.sources} numbers={sourceNumbers} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dit-muted">Nothing recorded for this question.</p>
              )}
            </TrackerSection>
          ))}
        </>
      )}

      {hasDetails(record, verified, labs) && <h2 className="dit-heading">Details</h2>}
      {verified && labs.length > 0 && (
        <TrackerSection title="Defence laboratories" count={labs.reduce((n, e) => n + (e.items?.length ?? 0), 0)}>
          {labs.map((e, i) => (
            <ul key={i} className="dit-plain-list">
              {(e.items ?? []).map((item) => <li key={item}>{item}</li>)}
            </ul>
          ))}
        </TrackerSection>
      )}
      {verified && record.topics.length > 0 && (
        <TrackerSection title="Research areas and STRA links" count={record.topics.length}>
          <ul className="dit-plain-list">
            {record.topics.map((t) => <li key={t}>{STRA_NAMES[t] ?? t}</li>)}
          </ul>
          <a className="dit-button" href="#stra-lookup">Open STRA Lookup</a>
        </TrackerSection>
      )}
      {verified && record.subunits.length > 0 && (
        <TrackerSection title="Campuses and subsidiaries" count={record.subunits.length}>
          <ul className="dit-plain-list">
            {record.subunits.map((s) => (
              <li key={s.name}>{[s.name, s.zh].filter(Boolean).join(' · ')}</li>
            ))}
          </ul>
        </TrackerSection>
      )}
      {(record.aliases.length > 0 || record.zhAliases.length > 0) && (
        <TrackerSection title="Also known as" count={record.aliases.length + record.zhAliases.length}>
          <ul className="dit-plain-list">
            {[...record.aliases, ...record.zhAliases].map((n) => <li key={n}>{n}</li>)}
          </ul>
        </TrackerSection>
      )}
      {record.sources.length > 0 && (
        <TrackerSection title="Sources" count={record.sources.length}>
          <ol className="dit-sources">
            {record.sources.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
                {[s.publisher, s.accessed && `accessed ${s.accessed}`].filter(Boolean).map((x) => ` · ${x}`)}
                {' · '}
                {s.archive?.url ? (
                  <a href={s.archive.url} target="_blank" rel="noopener noreferrer">Archived copy</a>
                ) : (
                  <span>No archived copy: {s.archive?.unavailable ?? 'not recorded'}</span>
                )}
              </li>
            ))}
          </ol>
        </TrackerSection>
      )}
      {record.history.length > 0 && (
        <TrackerSection title="Change history" count={record.history.length}>
          <ul className="dit-plain-list">
            {record.history.map((h, i) => (
              <li key={i}>
                {h.date}: {h.change}
              </li>
            ))}
          </ul>
        </TrackerSection>
      )}

      <p className="dit-footnote">
        Permanent link: <span className="dit-permalink">{permalink}</span>
        <br />
        This is institution-level information. Affiliation with a listed institution is not evidence of wrongdoing by an individual. Not
        legal advice; the official lists prevail.
      </p>
    </div>
  );
}
