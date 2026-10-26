import { useState } from 'react';
import { Copy, Download, Printer } from 'lucide-react';
import { SITE_URL } from '../../../siteConfig';
import { MAX_BATCH_LINES, matchLines } from './lib/matcher';
import { LIST_SHORT_LABELS } from './lib/constants';
import {
  batchResultsToCsv,
  batchResultsToHtml,
  batchResultsToText,
  countBatch,
  matchedByLabel,
  searchLogLine,
} from './lib/recordText';
import { downloadFile, localDate } from './download';
import RatingBadge from './RatingBadge';

const baseUrl = `${SITE_URL}/`;

function ResultRows({ line, byId }) {
  if (!line.matches.length) {
    return (
      <tr className="dit-row--none">
        <td>{line.input}</td>
        <td colSpan={5}>Not in tracker. That doesn&apos;t mean low risk.</td>
      </tr>
    );
  }
  return line.matches.map((m, i) => {
    const r = byId.get(m.id);
    const nro = r.listings.some((l) => l.listId === 'ca-nro' && l.status === 'listed');
    const others = r.listings.filter((l) => l.listId !== 'ca-nro' && l.status === 'listed').map((l) => LIST_SHORT_LABELS[l.listId]);
    const check = m.confidence !== 'confirmed';
    return (
      <tr key={m.id} className={check ? 'dit-row--check' : undefined}>
        <td>{i === 0 ? line.input : <span className="dit-muted">(same line)</span>}</td>
        <td>
          {check && <span className="dit-check-label">Check: </span>}
          <a href={`#defence-tracker/${r.id}`}>{r.name}</a>
        </td>
        <td>{matchedByLabel(m)}</td>
        <td><RatingBadge assessment={r.assessment} /></td>
        <td className={nro ? 'dit-status-cell--listed' : undefined}>{nro ? 'Yes' : 'No'}</td>
        <td>
          {others.join(', ') || (r.units?.length ? '' : '—')}
          {r.units?.map((u) => (
            <span key={u.id} className="dit-unit-note">
              Listed unit: <a href={`#defence-tracker/${u.id}`}>{u.name}</a> ({u.lists.join(', ')})
            </span>
          ))}
        </td>
      </tr>
    );
  });
}

export default function BatchCheck({ dataset, index, state, setState }) {
  const { text, result, checkedOn } = state;
  const [status, setStatus] = useState('');
  const counts = result && countBatch(result.lines);
  const logLine = result && searchLogLine({ date: checkedOn, meta: dataset.meta, counts });

  function check() {
    if (!text.trim()) {
      setStatus('Paste at least one affiliation, email address or name first.');
      return;
    }
    setStatus('');
    setState((s) => ({ ...s, result: matchLines(s.text, index), checkedOn: localDate() }));
  }

  async function copyTable() {
    const html = `${batchResultsToHtml(result.lines, dataset.byId, { baseUrl })}<p>${logLine}</p>`;
    const plain = `${batchResultsToText(result.lines, dataset.byId, { baseUrl })}\n\n${logLine}`;
    try {
      if (window.ClipboardItem && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plain], { type: 'text/plain' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plain);
      }
      setStatus('Table copied. Paste it into Word or a spreadsheet.');
    } catch {
      setStatus('Your browser blocked copying. Use Download CSV instead.');
    }
  }

  function downloadCsv() {
    const csv = `${batchResultsToCsv(result.lines, dataset.byId, { baseUrl })}\r\n${logLine}\r\n`;
    downloadFile(`defence-tracker-batch-${checkedOn}.csv`, csv, 'text/csv;charset=utf-8');
  }

  return (
    <div className="tool-page">
      <p className="dit-breadcrumb dit-no-print">
        <a href="#defence-tracker">Defence Institution Tracker</a> <span aria-hidden="true">›</span> Batch check
      </p>
      <div className="tool-page-header">
        <h1>Batch check</h1>
        <p>
          Check a whole co-author or partner list at once. Each line is matched by name, Chinese name, acronym or email domain, or
          by a named unit such as a university&apos;s hospital, and gets a dated line you can paste into your search log.
        </p>
      </div>

      <label className="dit-label" htmlFor="dit-batch-input">
        Paste affiliations, email addresses or a co-author list, one per line. Nothing leaves your browser.
      </label>
      <textarea
        id="dit-batch-input"
        className="dit-batch-input dit-no-print"
        rows={8}
        spellCheck={false}
        autoComplete="off"
        value={text}
        placeholder={'School of Astronautics, Harbin Inst. of Tech., Harbin 150001, China\nzhang.wei@nudt.edu.cn\n北京航空航天大学 宇航学院'}
        onChange={(e) => setState((s) => ({ ...s, text: e.target.value }))}
      />
      <div className="dit-actions dit-no-print">
        <button type="button" className="dit-button dit-button--primary" onClick={check}>Check affiliations</button>
        {(text || result) && (
          <button type="button" className="dit-button" onClick={() => setState({ text: '', result: null, checkedOn: null })}>Clear</button>
        )}
      </div>
      <p className="dit-status" aria-live="polite">
        {status ||
          (counts &&
            `${counts.lines} ${counts.lines === 1 ? 'line' : 'lines'}: ${counts.matched} matched, ${counts.check} to check, ${counts.notFound} not in tracker.`)}
      </p>

      {result && (
        <>
          {result.truncated && (
            <p className="dit-banner" role="note">
              Only the first {MAX_BATCH_LINES.toLocaleString()} of {result.totalLines.toLocaleString()} lines were checked. Split the
              list to check the rest.
            </p>
          )}
          <div className="dit-table-wrap">
            <table className="dit-table dit-batch-table">
              <thead>
                <tr>
                  <th scope="col">Your text</th>
                  <th scope="col">Match</th>
                  <th scope="col">Matched by</th>
                  <th scope="col">Rating</th>
                  <th scope="col">NRO</th>
                  <th scope="col">Other lists</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, i) => (
                  <ResultRows key={i} line={line} byId={dataset.byId} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="dit-logline">{logLine}</p>
          <div className="dit-actions dit-no-print">
            <button type="button" className="dit-button" onClick={copyTable}>
              <Copy size={15} aria-hidden="true" /> Copy table for report
            </button>
            <button type="button" className="dit-button" onClick={downloadCsv}>
              <Download size={15} aria-hidden="true" /> Download CSV
            </button>
            <button type="button" className="dit-button" onClick={() => window.print()}>
              <Printer size={15} aria-hidden="true" /> Print
            </button>
          </div>
          <p className="dit-footnote">
            A match is confirmed by an email domain, a full Chinese name, or a name together with the institution&apos;s country or
            city (or a name that includes them, like Harbin Institute of Technology). &quot;Check&quot; rows are possible matches: an
            acronym, a near spelling, an alternative or shared name, a unit named without its parent&apos;s city, or a name with no
            place. Confirm them before relying on them.
            A line that places itself in another country isn&apos;t matched. Not being in the tracker doesn&apos;t mean low risk.
          </p>
        </>
      )}
    </div>
  );
}
