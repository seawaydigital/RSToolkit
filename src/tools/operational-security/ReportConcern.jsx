import { useState } from 'react';
import { reportConcernData } from '../../data/reportConcernData';

function ContactCard({ contact }) {
  return (
    <li className={`rept-contact${contact.urgent ? ' rept-contact--urgent' : ''}`}>
      <span className="rept-contact-label">
        {contact.label}
        {contact.local && <span className="rept-contact-tag">at your institution</span>}
      </span>
      <span className="rept-contact-detail">{contact.detail}</span>
      <span className="rept-contact-links">
        {contact.phone && (
          <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>{contact.phone}</a>
        )}
        {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
        {contact.url && (
          <a href={contact.url} target="_blank" rel="noopener noreferrer">
            Official page &#8599;
          </a>
        )}
      </span>
    </li>
  );
}

export default function ReportConcern({ onNavigate }) {
  const [openId, setOpenId] = useState(null);

  const toggle = id => setOpenId(prev => (prev === id ? null : id));

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Report a Concern</h1>
        <p>{reportConcernData.intro}</p>
        <div className="tool-page-meta">
          <span>Last updated: {reportConcernData.lastUpdated}</span>
          <a href={reportConcernData.sourceUrl} target="_blank" rel="noopener noreferrer">
            {reportConcernData.sourceLabel}
          </a>
        </div>
      </div>

      {/* The main message of the page, deliberately above the scenarios. */}
      <section className="rept-first">
        <h2 className="rept-first-title">{reportConcernData.firstStep.title}</h2>
        <p>{reportConcernData.firstStep.body}</p>
        <p className="rept-first-exception">{reportConcernData.firstStep.exception}</p>
      </section>

      <h2 className="rept-section-title">What happened?</h2>
      <div className="rept-scenarios">
        {reportConcernData.scenarios.map(sc => {
          const isOpen = openId === sc.id;
          const panelId = `rept-panel-${sc.id}`;
          return (
            <div key={sc.id} className={`rept-scenario${isOpen ? ' rept-scenario--open' : ''}`}>
              <h3 className="rept-scenario-heading">
                <button
                  type="button"
                  className="rept-scenario-toggle"
                  onClick={() => toggle(sc.id)}
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? panelId : undefined}
                >
                  <span>{sc.title}</span>
                  <span className="rept-chevron" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
              </h3>

              {isOpen && (
                <div className="rept-scenario-body" id={panelId}>
                  <h4 className="rept-sublabel">Do this now</h4>
                  <ol className="rept-steps">
                    {sc.now.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>

                  <p className="rept-then">{sc.then}</p>

                  <h4 className="rept-sublabel">Who to contact</h4>
                  <ul className="rept-contact-list">
                    {sc.contacts.map(cid => {
                      const c = reportConcernData.contacts[cid];
                      return c ? <ContactCard key={cid} contact={c} /> : null;
                    })}
                  </ul>

                  {(sc.crossLink || sc.link) && (
                    <div className="rept-scenario-links">
                      {sc.crossLink && (
                        <button
                          type="button"
                          className="rept-crosslink"
                          onClick={() => onNavigate(sc.crossLink.tool)}
                        >
                          {sc.crossLink.label} &rarr;
                        </button>
                      )}
                      {sc.link && (
                        <a
                          className="rept-crosslink"
                          href={sc.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {sc.link.label} &#8599;
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <section className="rept-protections">
        <h2 className="rept-protections-title">{reportConcernData.protections.title}</h2>
        <ul className="rept-protections-list">
          {reportConcernData.protections.points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </section>

      <h2 className="rept-section-title">All contacts</h2>
      <ul className="rept-contact-list rept-contact-list--full">
        {Object.entries(reportConcernData.contacts).map(([id, c]) => (
          <ContactCard key={id} contact={c} />
        ))}
      </ul>
    </div>
  );
}
