import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ALL_TOOLS } from '../../data/toolRegistry';

export default function GlobalSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

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
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
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
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-modal-input"
          type="text"
          placeholder="Search tools, policies, organizations..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
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
