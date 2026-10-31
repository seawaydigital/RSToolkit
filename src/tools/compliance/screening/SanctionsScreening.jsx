import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Download, ListPlus, Printer, Upload } from 'lucide-react';
import { screeningData } from '../../../data/screeningData';
import { downloadFile, localDate } from '../../../utils/download';
import { countryName } from './lib/countries';
import { SCHEMA_LABELS, parseList } from './lib/parseList';
import { DATASETS, DEFAULT_THRESHOLD, KeyRejectedError, QuotaError, resultLabel, screenRows, topicLabel } from './lib/client';
import { DISCLAIMER, countResults, resultsToCsv, resultsToHtml, resultsToText, screeningLogLine } from './lib/resultsText';
import { EMPTY_LIST, getList, setList } from './handoff';
import ListBuilder from './ListBuilder';

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const STATUS_CLASS = { match: 'scr-result--match', possible: 'scr-result--possible', none: 'scr-result--none', error: 'scr-result--error' };

function Candidates({ candidates, id }) {
  return (
    <ul id={id} className="scr-candidates">
      {candidates.map((c) => (
        <li key={c.id}>
          <a href={c.url} target="_blank" rel="noopener noreferrer">
            {c.caption}
          </a>{' '}
          <span className="scr-muted">
            ({c.schema}, score {c.score.toFixed(2)}
            {c.countries.length > 0 && `, ${c.countries.map(countryName).join(', ')}`})
          </span>
          {c.topics.length > 0 && <span className="scr-note">{c.topics.map(topicLabel).join(' · ')}</span>}
          {c.lists.length > 0 && <span className="scr-note">Lists: {c.lists.join(', ')}</span>}
        </li>
      ))}
    </ul>
  );
}

function ResultRow({ row, result, index }) {
  const [open, setOpen] = useState(false);
  const best = result?.candidates?.[0];
  const more = result?.candidates?.length > 1;
  const panelId = `scr-candidates-${index}`;
  return (
    <tr className={result ? STATUS_CLASS[result.status] : undefined}>
      <td>
        {row.name}
        <span className="scr-note">
          {[SCHEMA_LABELS[row.schema], row.country && countryName(row.country), row.birthDate].filter(Boolean).join(' · ')}
        </span>
      </td>
      <td className="scr-result-cell">
        {result ? resultLabel(result) : <span className="scr-muted">Waiting</span>}
        {result?.nameOnly && <span className="scr-note">Add a country or birth date to tell them apart.</span>}
      </td>
      <td>
        {best ? (
          <>
            <a href={best.url} target="_blank" rel="noopener noreferrer">
              {best.caption}
            </a>
            {best.topics.length > 0 && <span className="scr-note">{best.topics.map(topicLabel).join(' · ')}</span>}
            {more && (
              <button
                type="button"
                className="scr-link-button scr-no-print"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={() => setOpen((o) => !o)}
              >
                {open ? 'Hide other candidates' : `Show all ${result.candidates.length} candidates`}
              </button>
            )}
            {open && <Candidates candidates={result.candidates} id={panelId} />}
          </>
        ) : (
          result?.error && <span className="scr-muted">{result.error}</span>
        )}
      </td>
      <td>{best ? best.score.toFixed(2) : ''}</td>
      <td>{best ? best.lists.join(', ') : ''}</td>
    </tr>
  );
}

export default function SanctionsScreening() {
  const [list, setListState] = useState(() => getList() ?? EMPTY_LIST);
  const [building, setBuilding] = useState(false);
  const [key, setKey] = useState('');
  const [dataset, setDataset] = useState('sanctions');
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState(null); // { date, dataset, threshold } of the last finished run
  const [status, setStatus] = useState('');
  const controller = useRef(null);
  const resultsHeading = useRef(null);
  const builderToggle = useRef(null);

  const rows = list.rows.filter((r) => r.name.trim());

  // The list lives in module memory too, so it survives a visit to another
  // tool; results belong to the list they were run on.
  function changeList(next) {
    setList(next);
    setListState(next);
    if (next.rows !== list.rows) {
      setResults([]);
      setRun(null);
    }
  }

  function closeBuilder() {
    setBuilding(false);
    builderToggle.current?.focus();
  }

  function openBuilder() {
    setBuilding(true);
    builderToggle.current?.focus();
  }

  const done = results.filter(Boolean).length;
  const counts = run && countResults(results);
  const logLine = run && screeningLogLine({ ...run, counts });

  function loadFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseList(String(reader.result ?? ''));
      changeList({ text: String(reader.result ?? ''), ...parsed, read: true });
      setStatus(`Loaded ${parsed.rows.length} entries. Open the list builder to check how they were read.`);
    };
    reader.onerror = () => setStatus('Your browser could not read that file.');
    reader.readAsText(file);
  }

  async function start() {
    if (!key.trim()) {
      setStatus('Enter your OpenSanctions API key first.');
      return;
    }
    const ctrl = new AbortController();
    controller.current = ctrl;
    const settings = { date: localDate(), dataset, threshold };
    const next = new Array(rows.length).fill(null);
    setResults(next);
    setRun(null);
    setRunning(true);
    setStatus(`Screening ${rows.length} entries…`);
    let stopped = '';
    try {
      await screenRows(rows, {
        key: key.trim(),
        dataset,
        threshold,
        fetchImpl: (...args) => window.fetch(...args),
        signal: ctrl.signal,
        onResult: (i, r) => {
          next[i] = r;
          setResults([...next]);
        },
      });
    } catch (e) {
      stopped =
        e instanceof KeyRejectedError
          ? `${e.message} Check the key and try again.`
          : e instanceof QuotaError
            ? `${e.message} Entries already checked are shown below; the rest can be screened once the quota resets, or after OpenSanctions raises it.`
            : 'Screening cancelled. Entries already checked are shown below.';
    }
    controller.current = null;
    setRunning(false);
    setRun(settings);
    setStatus(stopped || 'Screening finished.');
    resultsHeading.current?.focus();
  }

  async function copyTable() {
    const html = `${resultsToHtml(rows, results)}<p>${logLine}</p><p>${DISCLAIMER}</p>`;
    const plain = `${resultsToText(rows, results)}\n\n${logLine}\n${DISCLAIMER}`;
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
    const csv = `${resultsToCsv(rows, results)}\r\n${logLine}\r\n`;
    downloadFile(`sanctions-screening-${run.date}.csv`, csv, 'text/csv;charset=utf-8');
  }

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Sanctions Screening</h1>
        <p>
          Screen a list of people and organizations against OpenSanctions, which combines sanctions, export-control and other
          watch lists from many countries. Results come back in seconds, with the closest records and a dated line for your
          search log.
        </p>
        <div className="tool-page-meta">
          <span>Last updated: {screeningData.lastUpdated}</span>
          <a href={screeningData.sourceUrl} target="_blank" rel="noopener noreferrer">
            {screeningData.sourceLabel}
          </a>
        </div>
      </div>

      <p className="scr-banner" role="note">
        OpenSanctions is an aggregator, not the legal list. For Canadian obligations, check the{' '}
        <a href={screeningData.gacSanctionsUrl} target="_blank" rel="noopener noreferrer">
          Global Affairs Canada sanctions lists
        </a>{' '}
        and its{' '}
        <a href={screeningData.gacAcademicUrl} target="_blank" rel="noopener noreferrer">
          guidance for academic and research institutions
        </a>
        : prohibitions depend on the specific activity, so a match is a reason to look closer, not a ban on working together.
      </p>

      <section className="scr-howto scr-no-print" aria-labelledby="scr-howto-title">
        <h2 id="scr-howto-title" className="scr-howto-title">
          How to use this tool
        </h2>
        <p>
          You need two things: the names you want to check, and an OpenSanctions API key (step 2 explains which kind). Then work
          down the page:
        </p>
        <ol>
          <li>
            <strong>Add your list.</strong> Press <em>Build a list</em> and paste names in whatever form you have them: a co-author
            list, email signatures, or rows from a spreadsheet. Check that each entry is marked as a person or an organization, and
            add a country or birth date wherever you know one. Those cut false matches on common names.
          </li>
          <li>
            <strong>Paste your API key.</strong> It stays in this tab only and is forgotten when you close it.
          </li>
          <li>
            <strong>Leave the settings as they are</strong> unless you have a reason to change them: sanctions lists only, match
            threshold 0.70.
          </li>
          <li>
            <strong>Press Screen.</strong> Each entry takes about a second, and you can cancel at any time.
          </li>
          <li>
            <strong>Review the results.</strong> Open every match and possible match on OpenSanctions and compare the details. Then
            keep the dated log line, the copied table or the CSV in your file.
          </li>
        </ol>
      </section>

      <h2 className="scr-heading">1. Add your list</h2>
      <p className="scr-help">
        {rows.length
          ? `${count(rows.length, 'entry', 'entries')} ready (${count(rows.filter((r) => r.schema === 'Person').length, 'person', 'people')}, ${count(
              rows.filter((r) => r.schema === 'Organization').length,
              'organization',
              'organizations',
            )}, ${rows.filter((r) => r.schema === 'LegalEntity').length} either).`
          : 'No list yet. Press Build a list to paste names in any format, or load a CSV list you saved from this page before.'}
      </p>
      <div className="scr-actions scr-no-print">
        <button
          type="button"
          ref={builderToggle}
          className="scr-button"
          aria-expanded={building}
          aria-controls={building ? 'scr-builder' : undefined}
          disabled={running}
          onClick={() => (building ? closeBuilder() : setBuilding(true))}
        >
          <ListPlus size={15} aria-hidden="true" /> {rows.length ? 'Review or edit the list' : 'Build a list'}
          {building ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
        </button>
        {!building && (
          <label className="scr-button scr-file">
            <Upload size={15} aria-hidden="true" /> Load a CSV list
            <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" onChange={loadFile} disabled={running} />
          </label>
        )}
      </div>
      {building && <ListBuilder id="scr-builder" list={list} onChange={changeList} onDone={closeBuilder} />}

      <h2 className="scr-heading">2. Paste your OpenSanctions key</h2>
      <p id="scr-privacy" className="scr-privacy">
        <strong>Privacy:</strong> unlike most of this site, screening sends your list off your device. Each entry&apos;s name, type,
        country and birth date go, with your key and your IP address, to OpenSanctions (api.opensanctions.org) in Germany.{' '}
        <a href={screeningData.apiFaqUrl} target="_blank" rel="noopener noreferrer">
          OpenSanctions says
        </a>{' '}
        it holds the names only in memory while answering and never logs or stores them; its request logs, which include your IP
        address, are kept for 90 days, and a billing record for each entry, without the names, for three years. Nothing goes to this
        site, and nothing is saved here: your key and list stay in this tab&apos;s memory and are gone when you close it. Screen only
        what you need to, and leave out project details. <a href="#how-it-works">How this site handles your data</a>
      </p>
      <div className="scr-key-row scr-no-print">
        <label className="scr-label" htmlFor="scr-key">
          API key
        </label>
        <input
          id="scr-key"
          className="scr-key-input"
          type="password"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="scr-privacy scr-key-help"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        {key && (
          <button type="button" className="scr-button" onClick={() => setKey('')}>
            Forget key
          </button>
        )}
      </div>
      <p id="scr-key-help" className="scr-help">
        Each entry uses one request on your key. OpenSanctions{' '}
        <a href={screeningData.useUrl} target="_blank" rel="noopener noreferrer">
          counts compliance screening as commercial use
        </a>{' '}
        even when it earns nothing, so checking partners, co-authors or visitors needs a key that comes with a data licence. Its free
        keys are for journalists, public-interest groups and researchers studying sanctions. Your institution may already have a
        licence;{' '}
        <a href={screeningData.keyUrl} target="_blank" rel="noopener noreferrer">
          ask OpenSanctions
        </a>{' '}
        which applies to you.
      </p>

      <h2 className="scr-heading">3. Choose what to check against</h2>
      <div className="scr-settings scr-no-print">
        <label className="scr-label" htmlFor="scr-dataset">
          Check against
        </label>
        <select id="scr-dataset" className="scr-select" value={dataset} disabled={running} onChange={(e) => setDataset(e.target.value)}>
          {Object.entries(DATASETS).map(([id, d]) => (
            <option key={id} value={id}>
              {d.label}
            </option>
          ))}
        </select>
        <label className="scr-label" htmlFor="scr-threshold">
          Match threshold: {threshold.toFixed(2)}
        </label>
        <input
          id="scr-threshold"
          type="range"
          min="0.5"
          max="0.95"
          step="0.05"
          value={threshold}
          disabled={running}
          aria-describedby="scr-threshold-help"
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
        <p id="scr-threshold-help" className="scr-help">
          How close a record must be to count as a match. Leave it at 0.70 unless you have a reason: lower finds more, with more
          false alarms; higher finds fewer and can miss a different spelling. Records from 0.50 up are always shown as possible
          matches.
        </p>
      </div>

      <h2 className="scr-heading">4. Screen your list</h2>
      {!rows.length && <p className="scr-help">Add a list in step 1 first.</p>}
      <div className="scr-actions scr-no-print">
        {running ? (
          <button type="button" className="scr-button" onClick={() => controller.current?.abort()}>
            Cancel
          </button>
        ) : (
          <button type="button" className="scr-button scr-button--primary" disabled={!rows.length} onClick={start}>
            Screen {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
          </button>
        )}
      </div>
      <p className="scr-status" aria-live="polite">
        {running ? `Checked ${done} of ${rows.length}…` : status}
      </p>
      {running && <progress className="scr-progress" max={rows.length} value={done} aria-label="Screening progress" />}

      {results.length > 0 && (
        <>
          <h2 className="scr-heading" ref={resultsHeading} tabIndex={-1}>
            5. Results
            {counts && (
              <span className="scr-heading-note">
                {' '}
                · {counts.match} matched, {counts.possible} possible{counts.nameOnly ? ` (${counts.nameOnly} on a name alone)` : ''}, {counts.none} with no match found
                {counts.error ? `, ${counts.error} not checked` : ''}
              </span>
            )}
          </h2>
          <details className="scr-guide scr-no-print" open>
            <summary>What the results mean and what to do next</summary>
            <dl>
              <dt>Match</dt>
              <dd>
                An OpenSanctions record is very close to your entry. Open the record and compare the details: full name, birth date,
                country, affiliation. If it is the same person or organization, pause the activity and talk to your institution&apos;s
                research security office before going further.
              </dd>
              <dt>Possible match</dt>
              <dd>Close, but not close enough to be sure. A person needs to compare the details before deciding either way.</dd>
              <dt>Possible match (name only)</dt>
              <dd>
                A person was screened on a name alone, so the result can&apos;t tell them apart from someone else with the same name.
                Add a country or birth date and screen again.
              </dd>
              <dt>No match found</dt>
              <dd>
                Nothing close turned up in the data checked. That does not clear anyone: names are spelled differently, and lists
                change. Use your judgement and your institution&apos;s process as well.
              </dd>
              <dt>Not checked</dt>
              <dd>The request failed. Press Screen again to retry.</dd>
              <dt>Score and Lists</dt>
              <dd>
                The score (0 to 1) says how closely the record&apos;s details match your entry; it is not a measure of risk. Lists
                are short codes for the source lists; the record on OpenSanctions gives their full names.
              </dd>
            </dl>
            <p>
              Not sure what to do with a result? <a href="#report-concern">Report a Concern</a> says who to contact, starting with
              your own institution. To look further, <a href="#due-diligence-sources">Due Diligence Sources</a> explains the other
              open sources and how to read them.
            </p>
          </details>
          {counts?.nameOnly > 0 && (
            <div className="scr-banner scr-no-print" role="note">
              <p>
                {counts.nameOnly === 1 ? 'One person was' : `${counts.nameOnly} people were`} screened on a name alone, so a match
                can&apos;t tell them apart from someone else with the same name. These are shown as possible matches. Add a country
                or birth date and screen again to confirm or rule them out.
              </p>
              <button type="button" className="scr-link-button" onClick={openBuilder}>
                Add details in the list builder
              </button>
            </div>
          )}
          <div className="scr-table-wrap">
            <table className="scr-table">
              <thead>
                <tr>
                  <th scope="col">Your entry</th>
                  <th scope="col">Result</th>
                  <th scope="col">Closest record</th>
                  <th scope="col">Score</th>
                  <th scope="col">Lists</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <ResultRow key={row.id} row={row} result={results[i]} index={i} />
                ))}
              </tbody>
            </table>
          </div>
          {run && (
            <>
              <p className="scr-logline">{logLine}</p>
              <div className="scr-actions scr-no-print">
                <button type="button" className="scr-button" onClick={copyTable}>
                  <Copy size={15} aria-hidden="true" /> Copy table for report
                </button>
                <button type="button" className="scr-button" onClick={downloadCsv}>
                  <Download size={15} aria-hidden="true" /> Download CSV
                </button>
                <button type="button" className="scr-button" onClick={() => window.print()}>
                  <Printer size={15} aria-hidden="true" /> Print
                </button>
              </div>
            </>
          )}
          <p className="scr-footnote">
            {DISCLAIMER} Records link to OpenSanctions, which names each source list. Data:{' '}
            <a href={screeningData.siteUrl} target="_blank" rel="noopener noreferrer">
              OpenSanctions
            </a>
            , licensed{' '}
            <a href={screeningData.licenceUrl} target="_blank" rel="noopener noreferrer">
              CC BY-NC 4.0
            </a>
            ; screening for compliance needs a data licence from OpenSanctions.
          </p>
        </>
      )}
    </div>
  );
}
