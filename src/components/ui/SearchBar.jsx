import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ALL_TOOLS } from '../../data/toolRegistry';
export default function GlobalSearchModal({ onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const fuse = useMemo(() => new Fuse(ALL_TOOLS, { keys: ['name', 'description', 'tags'], threshold: 0.3 }), []);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    inputRef.current?.focus();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  const results = query.trim() ? fuse.search(query).map(r => r.item) : ALL_TOOLS;
  function keepFocus(event) {
    if (event.key !== 'Tab') return;
    const controls = [...dialogRef.current.querySelectorAll('button, input, a[href], select, [tabindex="0"]')].filter(el => !el.disabled);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  return <dialog ref={dialogRef} className="search-modal native-dialog" aria-labelledby="tool-search-title" onKeyDown={keepFocus} onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="dialog-heading"><h2 id="tool-search-title">Find a tool</h2><button onClick={onClose} aria-label="Close tool search">Close</button></header>
    <label htmlFor="tool-query">Tool name, policy or topic</label>
    <input ref={inputRef} id="tool-query" className="search-modal-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="For organizations, open NRO Lookup" />
    <p role="status">{results.length} tools found</p>
    <div className="search-modal-results">{results.map(tool => <button key={tool.id} className="search-modal-result" onClick={() => { onNavigate(tool.slug); onClose(); }}>
      <strong>{tool.name}</strong><span className="search-modal-result-desc">{tool.description}</span>
    </button>)}
    {!results.length && <p className="search-modal-empty">No tools match. Organization names are searched inside NRO Lookup.</p>}</div>
  </dialog>;
}
