import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { exportControlData } from '../../data/exportControlData';

const fuseOptions = {
  keys: [
    'title',
    'description',
    'keywords',
    'tags',
  ],
  threshold: 0.4,
  includeMatches: true,
};

const allEntries = exportControlData.sections.flatMap(section =>
  section.entries.map(entry => ({
    ...entry,
    sectionId: section.id,
  }))
);

const fuse = new Fuse(allEntries, fuseOptions);

const tagClassMap = {
  'dual-use': 'ec-tag--dual-use',
  military: 'ec-tag--military',
  sanctions: 'ec-tag--sanctions',
};

export default function ExportControl({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const filteredSections = useMemo(() => {
    if (!search.trim()) {
      return exportControlData.sections;
    }

    const results = fuse.search(search.trim());
    const matchedIds = new Set(results.map(r => r.item.id));

    return exportControlData.sections
      .map(section => ({
        ...section,
        entries: section.entries.filter(entry => matchedIds.has(entry.id)),
      }))
      .filter(section => section.entries.length > 0);
  }, [search]);

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Export Control Quick Reference</h1>
        <p>Searchable reference for EIPA, Controlled Goods List, sanctions, and regulations</p>
        <div className="tool-page-meta">
          <span>Last updated: {exportControlData.lastUpdated}</span>
          <a href={exportControlData.sourceUrl} target="_blank" rel="noopener noreferrer">
            Policy source
          </a>
        </div>
      </div>

      <input
        className="stra-search"
        type="text"
        placeholder="Search export controls, sanctions, regulations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredSections.map(section => {
        const isOpen = openSections[section.id] || search.trim().length > 0;

        return (
          <div key={section.id} className="ec-section">
            <button
              className="ec-section-header"
              onClick={() => toggleSection(section.id)}
            >
              {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              <span style={{ flex: 1 }}>{section.title}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                {section.entries.length} {section.entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </button>

            {isOpen && (
              <div>
                {section.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 14px 4px 28px' }}>
                    {section.description}
                  </p>
                )}
                {section.entries.map(entry => (
                  <div key={entry.id} className="ec-entry">
                    <div className="ec-entry-title">{entry.title}</div>
                    <div className="ec-entry-desc">{entry.description}</div>
                    <div className="ec-entry-tags">
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          className={`ec-tag ${tagClassMap[tag] || ''}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {entry.officialUrl && (
                      <a
                        className="ec-entry-link"
                        href={entry.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block', marginTop: 6 }}
                      >
                        Official source →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {filteredSections.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          No entries match your search.
        </div>
      )}
    </div>
  );
}
