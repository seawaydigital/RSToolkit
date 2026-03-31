import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { glossaryData } from '../../data/glossaryData';

const fuse = new Fuse(glossaryData.terms, {
  keys: ['term', 'shortDef', 'definition', 'category', 'tags'],
  threshold: 0.35,
  ignoreLocation: true,
});

const CATEGORIES = [...new Set(glossaryData.terms.map(t => t.category))].sort();

export default function Glossary({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    let terms = glossaryData.terms;
    if (search.trim()) {
      terms = fuse.search(search.trim()).map(r => r.item);
    }
    if (activeCategory !== 'All') {
      terms = terms.filter(t => t.category === activeCategory);
    }
    return [...terms].sort((a, b) => a.term.localeCompare(b.term));
  }, [search, activeCategory]);

  function toggle(id) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Glossary / Jargon Decoder</h1>
        <p>Official definitions for key research security terms from Canadian and Ontario Government sources</p>
        <div className="tool-page-meta">
          <span>Last updated: {glossaryData.lastUpdated}</span>
        </div>
      </div>

      <input
        className="stra-search"
        type="text"
        placeholder="Search terms, definitions, acronyms..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Category filter chips */}
      <div className="glossary-filters">
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            className={`glossary-filter-chip${activeCategory === cat ? ' glossary-filter-chip--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Term list */}
      <div className="glossary-list">
        {filtered.map(term => {
          const isOpen = expandedId === term.id;
          return (
            <div key={term.id} className={`glossary-item${isOpen ? ' glossary-item--open' : ''}`}>
              <button
                className="glossary-item-header"
                onClick={() => toggle(term.id)}
                aria-expanded={isOpen}
              >
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <span className="glossary-term">{term.term}</span>
                  {!isOpen && (
                    <span className="glossary-short-def">{term.shortDef}</span>
                  )}
                </div>
                <span className="glossary-category-badge">{term.category}</span>
                <span className="glossary-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="glossary-item-body">
                  <p className="glossary-definition">{term.definition}</p>
                  <div className="glossary-meta-row">
                    <div className="glossary-source">
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Source: </span>
                      {term.sourceUrl ? (
                        <a
                          href={term.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ec-entry-link"
                          style={{ fontSize: 12 }}
                        >
                          {term.source} →
                        </a>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{term.source}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          No terms match your search. Try different keywords or clear your filters.
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24, textAlign: 'center' }}>
        {glossaryData.sourceNote}
      </p>
    </div>
  );
}
