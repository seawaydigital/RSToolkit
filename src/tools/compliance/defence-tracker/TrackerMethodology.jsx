import { Download } from 'lucide-react';
import { INSTITUTION_RS_CONTACT, SITE_URL } from '../../../siteConfig';
import { howItWorksData } from '../../../data/howItWorksData';
import { SIGNALS } from './lib/constants';
import { RUBRIC_RULES, RUBRIC_VERSION } from './lib/rubric';
import { datasetToCsv, datasetToExport } from './lib/recordText';
import { downloadFile, localDate } from './download';
import RatingBadge from './RatingBadge';

const SIGNAL_GROUPS = [
  ['structural', 'Structural ties (Very high on their own)'],
  ['labs', 'Defence laboratories'],
  ['major', 'Major defence research'],
  ['substantial', 'Substantial defence research'],
  ['limited', 'Limited defence links'],
  ['misconduct', 'Shown as evidence, never sets the rating alone'],
  ['info', ''],
];

export default function TrackerMethodology({ dataset, changelog }) {
  const { meta } = dataset;
  const version = meta.version;

  return (
    <div className="tool-page">
      <p className="dit-breadcrumb dit-no-print">
        <a href="#defence-tracker">Defence Institution Tracker</a> <span aria-hidden="true">›</span> Methodology
      </p>
      <div className="tool-page-header">
        <h1>How the tracker works</h1>
        <p>
          What the ratings mean, the checklist behind them, the official lists checked, how profiles are verified and kept current,
          and how to reuse the data.
        </p>
        <div className="tool-page-meta">
          <span>Dataset {version}</span>
          <span>Rubric version {RUBRIC_VERSION}</span>
        </div>
      </div>

      <h2 className="dit-heading">What this is, and isn&apos;t</h2>
      <div className="dit-prose">
        <p>
          The tracker describes research institutions in China, Russia and Iran whose ties to the military or the security services
          matter for research security due diligence: grant partner and co-author checks under the National Security Guidelines for
          Research Partnerships (NSGRP) and the Policy on Sensitive Technology Research and Affiliations of Concern (STRAC).
        </p>
        <p>
          A rating summarizes an institution&apos;s documented ties. It is not a blacklist, a legal determination, or a judgement about
          any person who works or studies there. The official lists prevail, and this is not legal advice. An institution that is not
          in the tracker, or not on a list, is not thereby low risk.
        </p>
      </div>

      <h2 className="dit-heading">How ratings work</h2>
      <div className="dit-prose">
        <p>
          A researched (verified) profile is rated by the checklist below: the first rule it meets sets the rating, and only evidence
          that cites at least one source counts.
        </p>
        <p>
          An institution that has not been researched yet is rated by the one rule that needs no research: if any list the tracker
          checks names it, it is rated High, marked &quot;from official lists&quot;, and its page shows each listing as evidence with a
          link to the official source (&quot;The official lists checked&quot;, below, says which lists and when). Research can change that
          rating: a listed institution found to do major defence research, or to be part of the military, the security services or
          the defence industry, is rated Very high.
          An institution on none of the lists that has not been researched shows <RatingBadge assessment={null} />, which does not
          mean low risk.
        </p>
      </div>
      <div className="dit-table-wrap">
        <table className="dit-table">
          <thead>
            <tr>
              <th scope="col">Rating</th>
              <th scope="col">Rule</th>
            </tr>
          </thead>
          <tbody>
            {RUBRIC_RULES.map((r) => (
              <tr key={r.id}>
                <td><RatingBadge assessment={{ rating: r.rating }} /></td>
                <td>{r.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="dit-prose">
        <p>
          A reviewer can move a researched profile&apos;s rating up or down by one level, but only with a written reason, which is
          shown on the profile. A rating from the official lists alone is never adjusted.
          &quot;Formally listed&quot; means listed by Canada (Named Research Organizations or autonomous sanctions), the United States
          (Entity List, Military End-User List, Specially Designated Nationals, Section 1286 list) or Japan (End User List).
        </p>
      </div>
      <h3 className="dit-subheading">The evidence behind the rules</h3>
      <dl className="dit-signals">
        {SIGNAL_GROUPS.flatMap(([group, title]) => {
          const items = Object.values(SIGNALS).filter((s) => s.group === group);
          return [
            title && <dt key={`${group}-title`} className="dit-signal-group">{title}</dt>,
            ...items.map((s) => (
              <dd key={s.label}>
                <strong>{s.label}.</strong> {s.description}
              </dd>
            )),
          ].filter(Boolean);
        })}
      </dl>

      <h2 className="dit-heading">The official lists checked</h2>
      <div className="dit-table-wrap">
        <table className="dit-table">
          <thead>
            <tr>
              <th scope="col">List</th>
              <th scope="col">Status</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {dataset.lists.map((l) => (
              <tr key={l.listId}>
                <th scope="row">
                  {l.label}
                  <span className="dit-table-sub">{l.jurisdiction}</span>
                </th>
                <td className={l.coverage === 'complete' ? undefined : 'dit-status-cell--not-checked'}>
                  {l.coverage === 'complete' ? `Checked ${l.checkedOn ?? ''}` : 'Not checked yet'}
                  {l.listDate && <span className="dit-table-sub">List dated {l.listDate}</span>}
                </td>
                <td>
                  <a className="dit-text-link" href={l.sourceUrl} target="_blank" rel="noopener noreferrer">Official source</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="dit-prose">
        <p>
          The US screening lists and Canada&apos;s sanctions list are compared with their official downloads every month. The US
          Section 1286 list and Japan&apos;s End User List are entered by hand from each new edition; the table gives the date of the
          edition in use. The 1286 list is entered in full. From Japan&apos;s list, as from the US screening lists and Canada&apos;s
          sanctions list, only research bodies in China, Russia and Iran are entered. A list marked
          &quot;Not checked yet&quot; has not been entered, so every institution shows that status for it rather than &quot;Not
          listed&quot;.
        </p>
      </div>

      <h2 className="dit-heading">Verification and archiving</h2>
      <div className="dit-prose">
        <p>
          Every fact in a verified profile is a sentence in our own words with at least one source, preferring official documents and
          the institution&apos;s own pages. Each source has an archived copy, or a note saying why none could be made (some sites block
          archiving). No text, ratings or paid content from other trackers are reused. Profiles are re-checked about once a year, and
          each shows the date it was last verified.
        </p>
      </div>

      <h2 className="dit-heading">Institutions, never individuals</h2>
      <div className="dit-prose">
        <p>
          This tracker describes institutions, never individuals. Affiliation with a listed institution says nothing about a
          person&apos;s intentions, and Canadian research security guidance warns against profiling people by nationality or origin.
          Use a rating as one input to a proportionate, documented due diligence process.
        </p>
      </div>

      <h2 className="dit-heading" id="dit-downloads">Download the data</h2>
      <div className="dit-prose">
        <p>
          The whole dataset is open. Downloads are built in your browser from the data this page already has; nothing is sent
          anywhere.
        </p>
      </div>
      <div className="dit-actions dit-no-print">
        <button
          type="button"
          className="dit-button"
          onClick={() => downloadFile(`defence-tracker-${version}.json`, `${JSON.stringify(datasetToExport(dataset), null, 2)}\n`, 'application/json')}
        >
          <Download size={15} aria-hidden="true" /> Download JSON
        </button>
        <button type="button" className="dit-button" onClick={() => downloadFile(`defence-tracker-${version}.csv`, datasetToCsv(dataset), 'text/csv;charset=utf-8')}>
          <Download size={15} aria-hidden="true" /> Download CSV
        </button>
      </div>
      <div className="dit-prose">
        <p>
          For scripts, the published site also serves <span className="dit-permalink">{SITE_URL}/data/defence-tracker.json</span> and{' '}
          <span className="dit-permalink">{SITE_URL}/data/defence-tracker.csv</span>.
        </p>
      </div>

      <h2 className="dit-heading">Licence and how to cite</h2>
      <div className="dit-prose">
        <p>
          Dataset © {meta.license.year} {meta.license.holder}, licensed under{' '}
          <a className="dit-text-link" href={meta.license.url} target="_blank" rel="noopener noreferrer">{meta.license.name}</a>. You may
          reuse and adapt it, including commercially, with credit. The toolkit&apos;s code is separately licensed under the MIT licence.
        </p>
        <p className="dit-logline">
          Defence Institution Tracker, dataset {version}, {SITE_URL}/#defence-tracker, accessed {localDate()}. {meta.license.name}.
        </p>
      </div>

      <h2 className="dit-heading">Sources and credits</h2>
      <ul className="dit-plain-list">
        {meta.attributions.map((a) => (
          <li key={a.name}>
            <a className="dit-text-link" href={a.url} target="_blank" rel="noopener noreferrer">{a.name}</a> ({a.license}). {a.note}
          </li>
        ))}
      </ul>
      <p className="dit-muted">{meta.acknowledgement}</p>

      <h2 className="dit-heading">Changes to the dataset</h2>
      <ul className="dit-plain-list">
        {changelog.map((c) => (
          <li key={c.version}>
            <strong>{c.version}</strong> ({c.date}): {c.changes.join(' ')}
          </li>
        ))}
      </ul>

      <h2 className="dit-heading">Report a correction</h2>
      <div className="dit-prose">
        <p>
          Email <a className="dit-text-link" href={`mailto:${INSTITUTION_RS_CONTACT.email}?subject=Tracker%20correction`}>{INSTITUTION_RS_CONTACT.email}</a>{' '}
          or{' '}
          <a className="dit-text-link" href={`${howItWorksData.sourceUrl}/issues/new?template=tracker-correction.yml`} target="_blank" rel="noopener noreferrer">
            open a GitHub issue
          </a>
          , with a source for the correction. Each profile also has a &quot;Report an error&quot; link.
        </p>
      </div>
    </div>
  );
}
