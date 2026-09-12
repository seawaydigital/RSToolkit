import { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../../data/toolRegistry';

export default function Sidebar({ currentToolId, onNavigate, isOpen, onClose }) {
  const [expanded, setExpanded] = useState({});

  function toggleCategory(catId) {
    setExpanded(prev => ({ ...prev, [catId]: !(prev[catId] ?? CATEGORIES.find(c => c.id === catId).tools.some(t => t.id === currentToolId)) }));
  }

  function handleToolClick(toolSlug) {
    onNavigate(toolSlug);
    if (onClose) onClose();
  }

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <nav id="tool-navigation" inert={!isOpen} className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} aria-label="Tool navigation" onKeyDown={event => { if (event.key === 'Escape') { onClose?.(); document.querySelector('[aria-controls="tool-navigation"]')?.focus(); } }}>
        <div className="sidebar-scroll">
          <div className="sidebar-eyebrow">Toolkit · Categories</div>
          {CATEGORIES.map(cat => {
            const isExpanded = expanded[cat.id] ?? cat.tools.some(t => t.id === currentToolId);
            return (
              <div key={cat.id} className="sidebar-category">
                <button
                  className="sidebar-category-header"
                  onClick={() => toggleCategory(cat.id)}
                  aria-expanded={isExpanded}
                >
                  <span className="sidebar-category-icon">{cat.emoji}</span>
                  <span className="sidebar-category-label">{cat.label}</span>
                  <span className="sidebar-category-count">{cat.tools.length}</span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isExpanded && (
                  <ul className="sidebar-tool-list">
                    {cat.tools.map(tool => (
                      <li key={tool.id}>
                        <button
                          className={`sidebar-tool-item ${currentToolId === tool.id ? 'sidebar-tool-item--active' : ''}`}
                          onClick={() => handleToolClick(tool.slug)}
                          aria-current={currentToolId === tool.id ? 'page' : undefined}
                        >
                          {tool.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        <a
          className="sidebar-sister"
          href="https://rdmtoolkit.ca"
          target="_blank"
          rel="noopener noreferrer"
          title="Visit our sister site: RDM Toolkit"
          aria-label="Sister site: RDM Toolkit (opens in new tab)"
        >
          <ArrowUpRight className="sidebar-sister-arrow" size={16} aria-hidden="true" />
          <span className="sidebar-sister-logo">
            <span className="sidebar-sister-mark">RDM</span>
            <span className="sidebar-sister-word">Toolkit</span>
          </span>
          <span className="sidebar-sister-tagline">Research Data Management</span>
        </a>
      </nav>
    </>
  );
}
