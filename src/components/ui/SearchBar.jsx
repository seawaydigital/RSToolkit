import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ALL_TOOLS } from '../../data/toolRegistry';

export default function GlobalSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  const fuse = useMemo(() => new Fuse(ALL_TOOLS, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'description', weight: 1 },
      { name: 'tags', weight: 1.5 },
    ],
    threshold: 0.3,
    includeScore: true,
  }), []);

  useEffect(() => {
    if (isOpen) {
      // Remember what had focus so we can restore it when the dialog closes.
      previouslyFocused.current = document.activeElement;
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (previouslyFocused.current) {
      // Return focus to the trigger (WCAG 2.4.3 focus order).
      previouslyFocused.current.focus?.();
      previouslyFocused.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        // Trap focus within the dialog (WCAG 2.1.2 no keyboard trap / 2.4.3).
        const focusables = modalRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? fuse.search(query).map(r => r.item)
    : ALL_TOOLS;

  function handleSelect(tool) {
    onNavigate(tool.slug);
    onClose();
  }

  // Group by category
  const grouped = {};
  for (const tool of results) {
    const key = tool.categoryLabel;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tool);
  }

  return (
    // Backdrop click-to-dismiss is a pointer convenience; keyboard users close the
    // focus-trapped dialog via Escape (handled in the effect above), so the rule's
    // keyboard requirement is met without a redundant key handler on the overlay.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="search-modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="search-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
      >
        <input
          ref={inputRef}
          className="search-modal-input"
          type="text"
          placeholder="Search tools, policies, organizations..."
          aria-label="Search tools, policies, and organizations"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <p className="sr-only" aria-live="polite">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </p>
        <div className="search-modal-results">
          {results.length === 0 ? (
            <div className="search-modal-empty">
              No matches found. Try different keywords.
            </div>
          ) : (
            Object.entries(grouped).map(([category, tools]) => (
              <div key={category} className="search-modal-group">
                <div className="search-modal-group-label">{category}</div>
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    className="search-modal-result"
                    onClick={() => handleSelect(tool)}
                  >
                    <div>{tool.name}</div>
                    <div className="search-modal-result-desc">{tool.description}</div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
