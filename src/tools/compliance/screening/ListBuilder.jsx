import { useState } from 'react';
import { Check, Download, Plus, Trash2, Upload } from 'lucide-react';
import { downloadFile, localDate } from '../../../utils/download';
import { COUNTRY_OPTIONS, countryName } from './lib/countries';
import { FLAG_LABELS, MAX_ROWS, SCHEMA_LABELS, SCHEMAS, parseList, rowsToCsv } from './lib/parseList';
import { isNameOnly } from './lib/client';
import { EMPTY_LIST } from './handoff';

let nextId = 1;
const newId = () => `n${nextId++}`;

// The list builder, opened inside Sanctions Screening: paste or load any list,
// check how each line was read, correct it. Runs entirely in the browser;
// nothing is sent until the user presses Screen.
export default function ListBuilder({ id, list, onChange, onDone }) {
  const [status, setStatus] = useState('');
  const { text, rows, skipped, truncated, totalRows, read } = list;

  const update = (next) => onChange({ ...list, ...next });

  function readList(source = text) {
    if (!source.trim()) {
      setStatus('Paste a list or choose a file first.');
      return;
    }
    const parsed = parseList(source);
    update({ text: source, ...parsed, read: true });
    setStatus(
      `Read ${parsed.rows.length} ${parsed.rows.length === 1 ? 'entry' : 'entries'}` +
        `${parsed.skipped.length ? `; ${parsed.skipped.length} ${parsed.skipped.length === 1 ? 'line' : 'lines'} gave no name` : ''}. Check them below.`,
    );
  }

  function readFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2_000_000) {
      setStatus('That file is over 2 MB. Split it, or save just the name columns as CSV.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => readList(String(reader.result ?? ''));
    reader.onerror = () => setStatus('Your browser could not read that file.');
    reader.readAsText(file);
  }

  function editRow(rowId, field, value) {
    const clears = { schema: 'check-type', birthDate: 'date-ambiguous', country: 'country-unknown' }[field];
    update({
      rows: rows.map((r) => (r.id === rowId ? { ...r, [field]: value, flags: r.flags.filter((f) => f !== clears) } : r)),
    });
  }

  const removeRow = (rowId) => update({ rows: rows.filter((r) => r.id !== rowId) });
  const addRow = () =>
    rows.length < MAX_ROWS &&
    update({ rows: [...rows, { id: newId(), name: '', schema: 'LegalEntity', country: '', birthDate: '', flags: [], note: '', source: '' }], read: true });

  const ready = rows.filter((r) => r.name.trim());
  const flagged = rows.filter((r) => r.flags.length).length;

  return (
    <div id={id} className="scr-builder scr-no-print">
      <p className="scr-help">
        Paste a co-author, partner or visitor list in whatever shape it is in: one entry per line (&ldquo;Dr. Wei Zhang, School of
        Astronautics, Harbin Inst. of Tech., China&rdquo;), email signatures, or rows copied from a spreadsheet with a header row such
        as Name, Country, Date of birth. Reading the list happens in your browser; nothing is sent until you press Screen.
      </p>

      <label className="scr-label" htmlFor="scr-list-input">
        Paste your list, one person or organization per line
      </label>
      <textarea
        id="scr-list-input"
        className="scr-input"
        rows={8}
        spellCheck={false}
        autoComplete="off"
        value={text}
        placeholder={'Dr. Wei Zhang, School of Astronautics, Harbin Inst. of Tech., Harbin, China\nBauman Moscow State Technical University (Russia)\nMaria Garcia; Universidad de Chile, Santiago, Chile'}
        onChange={(e) => update({ text: e.target.value })}
      />
      <div className="scr-actions">
        <button type="button" className="scr-button scr-button--primary" onClick={() => readList()}>
          Read list
        </button>
        <label className="scr-button scr-file">
          <Upload size={15} aria-hidden="true" /> Choose a CSV or text file
          <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" onChange={readFile} />
        </label>
        {(text || rows.length > 0) && (
          <button
            type="button"
            className="scr-button"
            onClick={() => {
              onChange(EMPTY_LIST);
              setStatus('List cleared.');
            }}
          >
            Clear
          </button>
        )}
      </div>
      <p className="scr-status" aria-live="polite">
        {status}
      </p>

      {read && (
        <>
          {truncated && (
            <p className="scr-banner" role="note">
              Only the first {MAX_ROWS} of {totalRows} entries were kept. Split the list to screen the rest.
            </p>
          )}
          {skipped.length > 0 && (
            <div className="scr-banner" role="note">
              <p>These lines gave no name to screen. Add the name as a new entry if you need it checked:</p>
              <ul>
                {skipped.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <h3 className="scr-subheading">
            {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
            {flagged > 0 && <span className="scr-heading-note"> · {flagged} to check</span>}
          </h3>
          <p className="scr-help">
            Correct anything the reader got wrong. &ldquo;Either&rdquo; screens a name as a person and as an organization. A country or
            birth date narrows the match and cuts false alarms on common names.
          </p>
          <div className="scr-table-wrap">
            <table className="scr-table scr-edit-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Country</th>
                  <th scope="col">Birth date</th>
                  <th scope="col">Read from</th>
                  <th scope="col">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className={r.flags.length ? 'scr-row--check' : undefined}>
                    <td>
                      <input
                        className="scr-cell-input"
                        aria-label={`Name, entry ${i + 1}`}
                        value={r.name}
                        autoComplete="off"
                        spellCheck={false}
                        onChange={(e) => editRow(r.id, 'name', e.target.value)}
                      />
                      {r.flags.map((f) => (
                        <span key={f} className="scr-flag">
                          {FLAG_LABELS[f]}
                        </span>
                      ))}
                      {r.name.trim() && isNameOnly(r) && <span className="scr-note">Name only: a country or birth date cuts false matches</span>}
                    </td>
                    <td>
                      <select className="scr-cell-input" aria-label={`Type, entry ${i + 1}`} value={r.schema} onChange={(e) => editRow(r.id, 'schema', e.target.value)}>
                        {SCHEMAS.map((s) => (
                          <option key={s} value={s}>
                            {SCHEMA_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select className="scr-cell-input" aria-label={`Country, entry ${i + 1}`} value={r.country} onChange={(e) => editRow(r.id, 'country', e.target.value)}>
                        <option value="">Not set</option>
                        {r.country && !COUNTRY_OPTIONS.some((c) => c.code === r.country) && <option value={r.country}>{countryName(r.country)}</option>}
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {r.schema === 'Organization' ? (
                        <span className="scr-muted">—</span>
                      ) : (
                        <input
                          className="scr-cell-input scr-cell-input--date"
                          aria-label={`Birth date, entry ${i + 1} (YYYY-MM-DD or YYYY)`}
                          placeholder="YYYY-MM-DD"
                          value={r.birthDate}
                          autoComplete="off"
                          onChange={(e) => editRow(r.id, 'birthDate', e.target.value.trim())}
                        />
                      )}
                    </td>
                    <td className="scr-source">
                      {r.source || <span className="scr-muted">Added by hand</span>}
                      {r.note && <span className="scr-note">{r.note}</span>}
                    </td>
                    <td>
                      <button type="button" className="scr-icon-button" aria-label={`Remove entry ${i + 1}${r.name ? `, ${r.name}` : ''}`} onClick={() => removeRow(r.id)}>
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scr-actions">
            <button type="button" className="scr-button" onClick={addRow} disabled={rows.length >= MAX_ROWS}>
              <Plus size={15} aria-hidden="true" /> Add an entry
            </button>
            <button
              type="button"
              className="scr-button"
              disabled={!ready.length}
              onClick={() => downloadFile(`screening-list-${localDate()}.csv`, rowsToCsv(ready), 'text/csv;charset=utf-8')}
            >
              <Download size={15} aria-hidden="true" /> Download list as CSV
            </button>
          </div>
          <p className="scr-footnote">The downloaded CSV can be loaded straight back in, so a list only needs tidying once.</p>
        </>
      )}

      <div className="scr-actions">
        <button type="button" className="scr-button scr-button--primary" onClick={onDone}>
          <Check size={15} aria-hidden="true" /> {ready.length ? `Done: use ${ready.length} ${ready.length === 1 ? 'entry' : 'entries'}` : 'Close the list builder'}
        </button>
      </div>
    </div>
  );
}
