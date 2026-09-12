import { CONTENT_VERSION, policySources } from '../../data/policySources';
import { useSourceCurrency } from '../../hooks/useSourceCurrency';

export default function SourceNote({ ids, location }) {
  const unique = [...new Set(ids)];
  const current = useSourceCurrency(unique);
  return (
    <div className="source-note">
      <ul>{unique.map(id => {
        const source = policySources[id];
        return source ? <li key={id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
          <span> · {location || source.section} · verified {source.verifiedOn}{source.version ? ' · source version ' + source.version : ''} · review due {source.reviewDue}</span></li> : <li key={id}>Source unavailable</li>;
      })}</ul>
      {!current && <p className="notice">Source review is due or cannot be established. Check the official instructions before using this information. Device dates do not establish policy currency.</p>}
      {unique.includes('ocap') && <p>OCAP® is a registered trademark of the First Nations Information Governance Centre (FNIGC).</p>}
      <span className="print-only">Toolkit content {CONTENT_VERSION}. Working aid; no institutional approval.</span>
    </div>
  );
}
