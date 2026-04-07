import { CATEGORIES } from '../../data/toolRegistry';

const SCENARIOS = [
  {
    id: 'new-partner',
    label: 'Checking a new research partner?',
    icon: '🔍',
    desc: 'Verify whether a potential collaborator or funder is on the Named Research Organizations list and understand the compliance implications.',
    tools: ['nro-lookup', 'strac-flowchart', 'risk-mitigation'],
  },
  {
    id: 'partnership-grant',
    label: 'Applying for a partnership grant?',
    icon: '📋',
    desc: 'Walk through the NSGRP risk assessment process and complete a pre-application compliance check.',
    tools: ['risk-checklist', 'nsgrp-flowchart', 'stra-lookup'],
  },
  {
    id: 'sensitive-area',
    label: 'Working in a sensitive technology area?',
    icon: '⚡',
    desc: 'Check if your research falls under a Sensitive Technology Research Area and understand what that means for your tri-agency funding.',
    tools: ['stra-lookup', 'strac-flowchart', 'export-control'],
  },
  {
    id: 'new-to-rs',
    label: 'New to research security?',
    icon: '🎓',
    desc: 'Start with the tri-agency framework to understand the principles, then explore the key policies and how they apply to your work.',
    tools: ['tri-agency-guide', 'faq', 'glossary'],
  },
];

// Flat tool lookup by slug
const TOOL_MAP = Object.fromEntries(
  CATEGORIES.flatMap(c => c.tools.map(t => [t.slug, t]))
);

export default function Home({ onNavigate }) {
  return (
    <div className="home">
      <div className="home-hero">
        <h1>Research Security Toolkit</h1>
        <p className="home-hero-subtitle">
          Interactive tools to help Canadian researchers and institutions navigate federal
          research security policies, check compliance, and assess risks.
        </p>
      </div>

      {/* Start Here */}
      <section className="home-start">
        <h2 className="home-start-title">Where do I start?</h2>
        <div className="home-scenario-grid">
          {SCENARIOS.map(scenario => (
            <div key={scenario.id} className="home-scenario-card">
              <div className="home-scenario-header">
                <span className="home-scenario-icon">{scenario.icon}</span>
                <span className="home-scenario-label">{scenario.label}</span>
              </div>
              <p className="home-scenario-desc">{scenario.desc}</p>
              <div className="home-scenario-tools">
                {scenario.tools.map(slug => {
                  const tool = TOOL_MAP[slug];
                  if (!tool) return null;
                  return (
                    <button
                      key={slug}
                      className="home-scenario-tool-btn"
                      onClick={() => onNavigate(slug)}
                    >
                      {tool.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All tools by category */}
      <div className="home-all-tools-label">All Tools</div>
      {CATEGORIES.map(cat => (
        <section key={cat.id} className="home-category">
          <h2 className="home-category-title">
            <span className="home-category-emoji">{cat.emoji}</span>
            {cat.label}
          </h2>
          <p className="home-category-desc">{cat.description}</p>
          <div className="home-card-grid">
            {cat.tools.map(tool => (
              <button
                key={tool.id}
                className="home-card"
                onClick={() => onNavigate(tool.slug)}
              >
                <h3 className="home-card-title">{tool.name}</h3>
                <p className="home-card-desc">{tool.description}</p>
                <div className="home-card-tags">
                  {tool.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="home-card-tag">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}

      <footer className="home-footer">
        <p>
          Data sourced from Government of Canada publications. This toolkit provides guidance
          only and does not constitute legal advice. Always consult your institutional research
          security office for official determinations.
        </p>
      </footer>
    </div>
  );
}
