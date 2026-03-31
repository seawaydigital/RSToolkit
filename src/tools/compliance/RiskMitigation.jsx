import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { riskMitigationData } from '../../data/riskMitigationData';

const allMeasures = riskMitigationData.categories.flatMap(cat =>
  cat.measures.map(m => ({ ...m, categoryId: cat.id, categoryTitle: cat.title }))
);

const fuse = new Fuse(allMeasures, {
  keys: ['title', 'what', 'why', 'how', 'tags'],
  threshold: 0.35,
  ignoreLocation: true,
});

const TAG_LABELS = {
  always: 'Always applicable',
  partnership: 'Partnership grants',
  stra: 'STRA research',
  international: 'International collaboration',
};

const TAG_COLORS = {
  always: 'rm-tag--always',
  partnership: 'rm-tag--partnership',
  stra: 'rm-tag--stra',
  international: 'rm-tag--international',
};

export default function RiskMitigation({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [openIds, setOpenIds] = useState(new Set());
  const [openCategories, setOpenCategories] = useState(
    new Set(riskMitigationData.categories.map(c => c.id))
  );

  function toggleMeasure(id) {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCategory(id) {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const matchedIds = useMemo(() => {
    if (!search.trim()) return null;
    return new Set(fuse.search(search.trim()).map(r => r.item.id));
  }, [search]);

  const filteredCategories = useMemo(() => {
    return riskMitigationData.categories
      .map(cat => ({
        ...cat,
        measures: cat.measures.filter(m => {
          const passesSearch = !matchedIds || matchedIds.has(m.id);
          const passesTag = activeTag === 'all' || m.tags.includes(activeTag);
          return passesSearch && passesTag;
        }),
      }))
      .filter(cat => cat.measures.length > 0);
  }, [matchedIds, activeTag]);

  const isSearching = search.trim() || activeTag !== 'all';
  const displayOpenCategories = isSearching
    ? new Set(filteredCategories.map(c => c.id))
    : openCategories;

  const totalMeasures = riskMitigationData.categories.reduce((n, c) => n + c.measures.length, 0);
  const visibleMeasures = filteredCategories.reduce((n, c) => n + c.measures.length, 0);

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Risk Mitigation Guide</h1>
        <p>Practical measures to reduce national security risks in Canadian research — drawn from UBC Research Security, the U15 Guide, and Government of Canada guidance</p>
        <div className="tool-page-meta">
          <span>Last updated: {riskMitigationData.lastUpdated}</span>
          <a
            href="https://researchsecurity.ubc.ca/raf-guide/main-considerations-best-practices"
            target="_blank"
            rel="noopener noreferrer"
          >
            UBC source
          </a>
        </div>
      </div>

      <div className="rm-intro">
        {riskMitigationData.intro}
      </div>

      {/* Search + filter */}
      <input
        className="stra-search"
        type="text"
        placeholder="Search mitigation measures..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="rm-filters">
        {[['all', 'All measures'], ...Object.entries(TAG_LABELS)].map(([key, label]) => (
          <button
            key={key}
            className={`rm-filter-chip${activeTag === key ? ' rm-filter-chip--active' : ''}`}
            onClick={() => setActiveTag(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {isSearching && (
        <div className="rm-result-count">
          Showing {visibleMeasures} of {totalMeasures} measures
        </div>
      )}

      {/* Categories */}
      {filteredCategories.map(cat => {
        const isCatOpen = displayOpenCategories.has(cat.id);
        return (
          <div key={cat.id} className="rm-category">
            <button
              className="rm-category-header"
              onClick={() => toggleCategory(cat.id)}
            >
              <span className="rm-category-icon">{cat.icon}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <span className="rm-category-title">{cat.title}</span>
                <span className="rm-category-summary">{cat.summary}</span>
              </div>
              <span className="rm-category-count">{cat.measures.length}</span>
              {isCatOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isCatOpen && (
              <div className="rm-measures">
                <div className="rm-applicability">
                  Applies to: {cat.applicability}
                </div>
                {cat.measures.map(measure => {
                  const isOpen = openIds.has(measure.id) || (isSearching && matchedIds?.has(measure.id));
                  return (
                    <div
                      key={measure.id}
                      className={`rm-measure${isOpen ? ' rm-measure--open' : ''}`}
                    >
                      <button
                        className="rm-measure-header"
                        onClick={() => toggleMeasure(measure.id)}
                        aria-expanded={isOpen}
                      >
                        <span className="rm-measure-title">{measure.title}</span>
                        <div className="rm-measure-tags">
                          {measure.tags.map(tag => (
                            <span key={tag} className={`rm-tag ${TAG_COLORS[tag] || ''}`}>
                              {TAG_LABELS[tag] || tag}
                            </span>
                          ))}
                        </div>
                        {isOpen ? <ChevronDown size={14} style={{ flexShrink: 0 }} /> : <ChevronRight size={14} style={{ flexShrink: 0 }} />}
                      </button>

                      {isOpen && (
                        <div className="rm-measure-body">
                          <div className="rm-measure-section">
                            <span className="rm-section-label">What</span>
                            <p>{measure.what}</p>
                          </div>
                          <div className="rm-measure-section">
                            <span className="rm-section-label">Why it matters</span>
                            <p>{measure.why}</p>
                          </div>
                          <div className="rm-measure-section">
                            <span className="rm-section-label">How to implement</span>
                            <p>{measure.how}</p>
                          </div>
                          {measure.relatedTool && (
                            <button
                              className="faq-related-tool"
                              onClick={() => onNavigate?.(measure.relatedTool)}
                            >
                              Open related tool →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {filteredCategories.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          No measures match your search. Try different keywords or clear your filters.
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24, textAlign: 'center' }}>
        {riskMitigationData.sourceNote}
      </p>
    </div>
  );
}
