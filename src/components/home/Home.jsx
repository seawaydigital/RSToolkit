import { CATEGORIES } from '../../data/toolRegistry';

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
