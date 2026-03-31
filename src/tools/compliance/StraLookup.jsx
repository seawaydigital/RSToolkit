import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { straData } from '../../data/straData';
import { straWizard } from '../../data/straWizard';

// Build flat list for Fuse search
const searchItems = straData.categories.flatMap(cat =>
  cat.subcategories.map(sub => ({
    ...sub,
    categoryId: cat.id,
    categoryName: cat.name,
  }))
);

const fuse = new Fuse(searchItems, {
  keys: ['name', 'description', 'keywords', 'categoryName'],
  threshold: 0.35,
  ignoreLocation: true,
});

export default function StraLookup({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(new Set());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardHistory, setWizardHistory] = useState([straWizard.startQuestion]);

  // Filter categories based on search
  const { filteredCategories, matchedSubIds } = useMemo(() => {
    if (!search.trim()) {
      return { filteredCategories: straData.categories, matchedSubIds: new Set() };
    }
    const results = fuse.search(search.trim());
    const subIds = new Set(results.map(r => r.item.id));
    const catIds = new Set(results.map(r => r.item.categoryId));

    const filtered = straData.categories
      .filter(cat => catIds.has(cat.id))
      .map(cat => ({
        ...cat,
        subcategories: cat.subcategories.filter(sub => subIds.has(sub.id)),
      }));

    return { filteredCategories: filtered, matchedSubIds: subIds };
  }, [search]);

  // Auto-expand categories when searching
  const expandedSet = useMemo(() => {
    if (search.trim()) {
      return new Set(filteredCategories.map(c => c.id));
    }
    return expanded;
  }, [search, filteredCategories, expanded]);

  function toggleCategory(catId) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  // Wizard logic
  const currentQId = wizardHistory[wizardHistory.length - 1];
  const currentQ = straWizard.questions[currentQId];

  function wizardGo(nextId) {
    setWizardHistory(prev => [...prev, nextId]);
  }

  function wizardBack() {
    if (wizardHistory.length > 1) {
      setWizardHistory(prev => prev.slice(0, -1));
    }
  }

  function wizardRestart() {
    setWizardHistory([straWizard.startQuestion]);
  }

  function openWizard() {
    setWizardHistory([straWizard.startQuestion]);
    setWizardOpen(true);
  }

  const riskColors = {
    high: 'var(--red)',
    medium: 'var(--amber)',
    low: 'var(--green)',
    none: 'var(--green)',
  };

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>STRA Lookup</h1>
        <p>Search and browse Sensitive Technology Research Areas with guided assessment</p>
        <div className="tool-page-meta">
          <span>List last modified: {straData.lastUpdated}</span>
          <a href={straData.sourceUrl} target="_blank" rel="noopener noreferrer">Policy source</a>
        </div>
      </div>

      {/* Search */}
      <input
        className="stra-search"
        type="text"
        placeholder="Search by technology area, keyword, or description..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Wizard CTA */}
      <div className="stra-wizard-cta">
        <button className="stra-wizard-btn" onClick={openWizard}>
          Not sure? Take the guided assessment
        </button>
      </div>

      {/* Category tree */}
      <ul className="stra-tree">
        {filteredCategories.map(cat => {
          const isOpen = expandedSet.has(cat.id);
          return (
            <li key={cat.id} className="stra-category-item">
              <button
                className="stra-category-header"
                onClick={() => toggleCategory(cat.id)}
              >
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span style={{ flex: 1 }}>{cat.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {cat.subcategories.length}
                </span>
              </button>
              {isOpen && (
                <ul className="stra-subcategory-list">
                  {cat.subcategories.map(sub => (
                    <li
                      key={sub.id}
                      className="stra-subcategory-item"
                      style={matchedSubIds.has(sub.id) ? { borderLeftColor: 'var(--accent)' } : {}}
                    >
                      <strong>{sub.name}</strong>
                      <div className="stra-subcategory-desc">{sub.description}</div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {filteredCategories.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          No categories match your search. Try different keywords or browse all categories.
        </div>
      )}

      {/* Wizard Modal */}
      {wizardOpen && currentQ && (
        <div className="wizard-overlay" onClick={() => setWizardOpen(false)}>
          <div className="wizard-modal" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button
              onClick={() => setWizardOpen(false)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {currentQ.type === 'result' ? (
              /* Result screen */
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: currentQ.riskLevel === 'high' ? 'var(--red-subtle)' :
                      currentQ.riskLevel === 'medium' ? 'var(--amber-subtle)' : 'var(--green-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', fontSize: 24,
                  }}
                >
                  {currentQ.riskLevel === 'high' ? '!' :
                    currentQ.riskLevel === 'medium' ? '?' : '\u2713'}
                </div>
                <h2 style={{ fontSize: 18, marginBottom: 12 }}>{currentQ.title}</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {currentQ.description}
                </p>
                <div
                  style={{
                    display: 'inline-block', padding: '4px 14px',
                    borderRadius: 20, fontSize: 13, fontWeight: 600,
                    color: riskColors[currentQ.riskLevel],
                    background: currentQ.riskLevel === 'high' ? 'var(--red-subtle)' :
                      currentQ.riskLevel === 'medium' ? 'var(--amber-subtle)' : 'var(--green-subtle)',
                    marginBottom: 16,
                  }}
                >
                  {currentQ.riskLevel === 'high' ? 'High likelihood' :
                    currentQ.riskLevel === 'medium' ? 'Possible — review full list' : 'Unlikely'}
                </div>
                {currentQ.matchedCategories?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Matched categories — click to view in the browse list:
                    </p>
                    {currentQ.matchedCategories.map(catId => {
                      const cat = straData.categories.find(c => c.id === catId);
                      return cat ? (
                        <button
                          key={catId}
                          onClick={() => {
                            setWizardOpen(false);
                            setSearch('');
                            setExpanded(new Set([catId]));
                          }}
                          style={{
                            display: 'block', margin: '4px auto', padding: '6px 16px',
                            background: 'var(--accent-subtle)', border: '1px solid var(--accent)',
                            borderRadius: 'var(--radius)', color: 'var(--accent)',
                            cursor: 'pointer', fontSize: 13,
                          }}
                        >
                          {cat.name}
                        </button>
                      ) : null;
                    })}
                  </div>
                )}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
                  This assessment is for guidance only and does not constitute a legal determination.
                  Always consult your institutional research security office.
                </p>
                <div className="guided-buttons" style={{ marginTop: 16 }}>
                  <button className="guided-btn guided-btn--back" onClick={wizardBack}>Back</button>
                  <button className="guided-btn guided-btn--continue" onClick={wizardRestart}>Start Over</button>
                </div>
              </div>
            ) : (
              /* Question screen */
              <div style={{ textAlign: 'center' }}>
                <div className="guided-progress" style={{ marginBottom: 8 }}>
                  <span>Step {wizardHistory.length}</span>
                  <span>STRA Assessment</span>
                </div>
                <h2 style={{ fontSize: 16, marginBottom: 8, lineHeight: 1.5 }}>{currentQ.text}</h2>
                {currentQ.helpText && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                    {currentQ.helpText}
                  </p>
                )}
                <div className="guided-buttons" style={{ marginTop: 16 }}>
                  {wizardHistory.length > 1 && (
                    <button className="guided-btn guided-btn--back" onClick={wizardBack}>Back</button>
                  )}
                  {currentQ.type === 'yesno' && (
                    <>
                      <button className="guided-btn guided-btn--yes" onClick={() => wizardGo(currentQ.yes)}>Yes</button>
                      <button className="guided-btn guided-btn--no" onClick={() => wizardGo(currentQ.no)}>No</button>
                    </>
                  )}
                  {currentQ.type === 'choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                      {currentQ.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => wizardGo(opt.next)}
                          style={{
                            padding: '10px 16px', background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                            color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14,
                            textAlign: 'left', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; }}
                          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
