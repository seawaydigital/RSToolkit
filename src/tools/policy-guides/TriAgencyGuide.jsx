import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { triAgencyData } from '../../data/triAgencyData';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'principles', label: '10 Principles' },
  { id: 'policies', label: 'Key Policies' },
];

export default function TriAgencyGuide({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [openPrinciples, setOpenPrinciples] = useState(new Set());

  function togglePrinciple(id) {
    setOpenPrinciples(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setOpenPrinciples(new Set(triAgencyData.principles.map(p => p.id)));
  }

  function collapseAll() {
    setOpenPrinciples(new Set());
  }

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Tri-Agency Research Security Guidance</h1>
        <p>Plain-language explainer of the federal granting agencies' research security framework</p>
        <div className="tool-page-meta">
          <span>Last updated: {triAgencyData.lastUpdated}</span>
          <a href={triAgencyData.sourceUrl} target="_blank" rel="noopener noreferrer">
            Official source
          </a>
        </div>
      </div>

      {/* Agency badges */}
      <div className="trag-agencies">
        {triAgencyData.agencies.map(a => (
          <a
            key={a.id}
            href={a.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="trag-agency-badge"
            title={a.fullName}
          >
            {a.name}
          </a>
        ))}
      </div>

      {/* Tabs */}
      <div className="trag-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`trag-tab${activeTab === tab.id ? ' trag-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="trag-tab-content">
          {/* Definition */}
          <div className="trag-definition">
            <div className="trag-definition-label">What is Research Security?</div>
            <p>{triAgencyData.definition}</p>
          </div>

          {/* Shared responsibility */}
          <div className="trag-section">
            <h2 className="trag-section-title">Shared Responsibility</h2>
            <p className="trag-section-body">
              Research security is not the sole responsibility of researchers. The Government of Canada frames it as a shared obligation across four groups:
            </p>
            <div className="trag-responsibility-grid">
              {triAgencyData.sharedResponsibility.map((r, i) => (
                <div key={i} className="trag-responsibility-card">
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core commitment */}
          <div className="trag-commitment">
            <div className="trag-commitment-label">Core Commitment</div>
            <p>{triAgencyData.coreCommitment}</p>
          </div>

          {/* International */}
          <div className="trag-section">
            <h2 className="trag-section-title">{triAgencyData.internationalContext.title}</h2>
            <p className="trag-section-body">{triAgencyData.internationalContext.text}</p>
          </div>

          {/* Navigation prompt */}
          <div className="trag-nav-prompt">
            <p>Use the tabs above to explore the 10 guiding principles and the two key policies (NSGRP and STRAC).</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="trag-nav-btn" onClick={() => setActiveTab('principles')}>
                View 10 Principles →
              </button>
              <button className="trag-nav-btn" onClick={() => setActiveTab('policies')}>
                View Key Policies →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Principles Tab ── */}
      {activeTab === 'principles' && (
        <div className="trag-tab-content">
          <p className="trag-intro-text">
            Canada's research security framework is built on 10 guiding principles that balance national security with the values of open science, academic freedom, and inclusion. Every policy and requirement must be interpreted in light of these principles.
          </p>

          <div className="trag-expand-controls">
            <button className="trag-expand-btn" onClick={expandAll}>Expand all</button>
            <button className="trag-expand-btn" onClick={collapseAll}>Collapse all</button>
          </div>

          <div className="trag-principles-list">
            {triAgencyData.principles.map(p => {
              const isOpen = openPrinciples.has(p.id);
              return (
                <div key={p.id} className={`trag-principle${isOpen ? ' trag-principle--open' : ''}`}>
                  <button
                    className="trag-principle-header"
                    onClick={() => togglePrinciple(p.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="trag-principle-number">{p.number}</span>
                    <span className="trag-principle-icon">{p.icon}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <span className="trag-principle-title">{p.title}</span>
                      {!isOpen && (
                        <span className="trag-principle-summary">{p.summary}</span>
                      )}
                    </div>
                    {isOpen ? <ChevronDown size={16} style={{ flexShrink: 0 }} /> : <ChevronRight size={16} style={{ flexShrink: 0 }} />}
                  </button>

                  {isOpen && (
                    <div className="trag-principle-body">
                      <div className="trag-principle-section">
                        <div className="trag-principle-section-label">Official Definition</div>
                        <p>{p.full}</p>
                      </div>
                      <div className="trag-principle-section trag-principle-section--highlight">
                        <div className="trag-principle-section-label">What This Means for You</div>
                        <p>{p.whatItMeansForYou}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Policies Tab ── */}
      {activeTab === 'policies' && (
        <div className="trag-tab-content">
          <p className="trag-intro-text">
            The tri-agency guidance covers two distinct policies. They have different triggers, different processes, and different consequences. Understanding the difference is essential.
          </p>

          {/* Comparison summary */}
          <div className="trag-compare-table">
            <div className="trag-compare-header">
              <div className="trag-compare-cell trag-compare-cell--label"></div>
              {triAgencyData.policies.map(pol => (
                <div key={pol.id} className={`trag-compare-cell trag-compare-cell--heading trag-compare-cell--${pol.color}`}>
                  <span>{pol.icon}</span> {pol.acronym}
                </div>
              ))}
            </div>
            {[
              { label: 'Type', keys: ['type'], values: ['Risk-based assessment process', 'Hard eligibility rule'] },
              { label: 'Applies when', values: triAgencyData.policies.map(p => p.when) },
              { label: 'Process', values: triAgencyData.policies.map(p => p.what.substring(0, 120) + '…') },
            ].map((row, i) => (
              <div key={i} className="trag-compare-row">
                <div className="trag-compare-cell trag-compare-cell--label">{row.label}</div>
                {row.values.map((val, j) => (
                  <div key={j} className="trag-compare-cell">{val}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Policy detail cards */}
          {triAgencyData.policies.map(pol => (
            <div key={pol.id} className={`trag-policy-card trag-policy-card--${pol.color}`}>
              <div className="trag-policy-card-header">
                <span className="trag-policy-icon">{pol.icon}</span>
                <div>
                  <div className="trag-policy-acronym">{pol.acronym}</div>
                  <div className="trag-policy-title">{pol.title}</div>
                </div>
              </div>

              <div className="trag-policy-oneliner">{pol.oneLiner}</div>

              <div className="trag-policy-section">
                <div className="trag-policy-section-label">When it applies</div>
                <p>{pol.when}</p>
              </div>

              <div className="trag-policy-section">
                <div className="trag-policy-section-label">What it requires</div>
                <p>{pol.what}</p>
              </div>

              <div className="trag-policy-section">
                <div className="trag-policy-section-label">Key points</div>
                <ul className="trag-key-points">
                  {pol.keyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="trag-policy-actions">
                <button
                  className="trag-tool-btn"
                  onClick={() => onNavigate?.(pol.relatedTool)}
                >
                  {pol.relatedToolLabel} →
                </button>
                <a
                  href={pol.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trag-source-link"
                >
                  Official policy →
                </a>
              </div>
            </div>
          ))}

          {/* Key distinction callout */}
          <div className="trag-distinction">
            <div className="trag-distinction-title">Key Distinction</div>
            <p>
              The <strong>NSGRP</strong> is a process — your application goes through a risk review and may result in conditions, mitigation requirements, or denial after assessment.
              The <strong>STRAC Policy</strong> is a rule — if you are in a STRA and have an NRO affiliation, you are ineligible. There is no review that could result in approval.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
