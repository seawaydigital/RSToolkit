import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { faqData } from '../../data/faqData';

const allFaqs = faqData.categories.flatMap(cat =>
  cat.faqs.map(faq => ({ ...faq, categoryId: cat.id, categoryTitle: cat.title }))
);

const fuse = new Fuse(allFaqs, {
  keys: ['question', 'answer', 'tags'],
  threshold: 0.35,
  ignoreLocation: true,
});

export default function Faq({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState(new Set());

  function toggleFaq(id) {
    setOpenIds(prev => {
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
    if (!matchedIds) return faqData.categories;
    return faqData.categories
      .map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(faq => matchedIds.has(faq.id)),
      }))
      .filter(cat => cat.faqs.length > 0);
  }, [matchedIds]);

  // Auto-expand matched FAQs when searching
  const openSet = useMemo(() => {
    if (matchedIds) return matchedIds;
    return openIds;
  }, [matchedIds, openIds]);

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Research Security FAQ</h1>
        <p>Common questions and answers about research security compliance in Canada</p>
        <div className="tool-page-meta">
          <span>Last updated: {faqData.lastUpdated}</span>
        </div>
      </div>

      <input
        className="stra-search"
        type="text"
        placeholder="Search questions..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filteredCategories.map(cat => (
        <div key={cat.id} className="faq-category">
          <div className="faq-category-title">
            <span style={{ marginRight: 8 }}>{cat.icon}</span>
            {cat.title}
          </div>

          <div className="faq-list">
            {cat.faqs.map(faq => {
              const isOpen = openSet.has(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`faq-item${isOpen ? ' faq-item--open' : ''}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? <ChevronDown size={16} style={{ flexShrink: 0 }} /> : <ChevronRight size={16} style={{ flexShrink: 0 }} />}
                    <span>{faq.question}</span>
                  </button>

                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                      {faq.relatedTool && (
                        <button
                          className="faq-related-tool"
                          onClick={() => onNavigate?.(faq.relatedTool)}
                        >
                          Open related tool →
                        </button>
                      )}
                      {faq.relatedTools?.length > 0 && (
                        <div className="faq-related-tools">
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Related tools: </span>
                          {faq.relatedTools.map(slug => (
                            <button
                              key={slug}
                              className="faq-related-tool"
                              onClick={() => onNavigate?.(slug)}
                            >
                              {slug.replace(/-/g, ' ')} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filteredCategories.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          No questions match your search. Try different keywords.
        </div>
      )}

      <div className="faq-disclaimer">
        This FAQ is for general guidance only and does not constitute legal advice.
        Always consult your institution's research security office and official Government of Canada
        sources for authoritative guidance.
      </div>
    </div>
  );
}
