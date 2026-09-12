import { useState, useEffect } from 'react';
import { TabList, TabPanel } from '../../components/ui/Tabs';
import { travelSecurityData } from '../../data/travelSecurityData';

const STORAGE_KEY = 'rs-toolkit-travel-v1';

const TABS = travelSecurityData.phases.map(p => ({ id: p.id, label: p.label }));

const ALL_ITEMS = travelSecurityData.phases.flatMap(p =>
  p.groups.flatMap(g => g.items.map(i => i.id))
);

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function TravelSecurity({ onNavigate }) {
  const [activePhase, setActivePhase] = useState('before');
  const [checked, setChecked] = useState(loadSaved);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      // localStorage unavailable — the checklist still works for this session
    }
  }, [checked]);

  const toggle = id => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleDetail = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const reset = () => setChecked({});

  const doneCount = ALL_ITEMS.filter(id => checked[id]).length;
  const pct = Math.round((doneCount / ALL_ITEMS.length) * 100);

  function phaseProgress(phase) {
    const ids = phase.groups.flatMap(g => g.items.map(i => i.id));
    return { done: ids.filter(id => checked[id]).length, total: ids.length };
  }

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Research Travel Security</h1>
        <p>{travelSecurityData.intro}</p>
        <div className="tool-page-meta">
          <span>Last updated: {travelSecurityData.lastUpdated}</span>
          <a href={travelSecurityData.sourceUrl} target="_blank" rel="noopener noreferrer">
            {travelSecurityData.sourceLabel}
          </a>
        </div>
      </div>

      {/* Overall progress */}
      <div className="checklist-progress-bar-wrap trav-no-print">
        <div className="checklist-progress-bar-header">
          <span>Trip preparation</span>
          <span className="checklist-progress-pct">
            {doneCount} of {ALL_ITEMS.length} done
          </span>
        </div>
        <div className="checklist-progress-bar-track">
          <div className="checklist-progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <TabList
        tabs={TABS}
        activeId={activePhase}
        onChange={setActivePhase}
        prefix="trav"
        label="Travel phases"
        extraClass="trav-no-print"
      />

      {travelSecurityData.phases.map(phase => {
        if (phase.id !== activePhase) return null;
        const p = phaseProgress(phase);
        return (
          <TabPanel key={phase.id} id={phase.id} prefix="trav">
            <p className="trav-phase-intro">{phase.intro}</p>
            <p className="trav-phase-count trav-no-print">
              {p.done}/{p.total} complete in this phase
            </p>

            {phase.groups.map(group => (
              <section key={group.id} className="trav-group">
                <h2 className="trav-group-title">{group.title}</h2>
                <ul className="trav-list">
                  {group.items.map(item => {
                    const isChecked = !!checked[item.id];
                    const isOpen = !!expanded[item.id];
                    return (
                      <li
                        key={item.id}
                        className={`trav-item${isChecked ? ' trav-item--done' : ''}`}
                      >
                        <div className="trav-item-row">
                          <input
                            type="checkbox"
                            id={`trav-${item.id}`}
                            className="trav-checkbox"
                            checked={isChecked}
                            onChange={() => toggle(item.id)}
                          />
                          <label htmlFor={`trav-${item.id}`} className="trav-item-label">
                            {item.text}
                          </label>
                        </div>

                        <div className="trav-item-actions trav-no-print">
                          {item.detail && (
                            <button
                              type="button"
                              className="trav-detail-toggle"
                              onClick={() => toggleDetail(item.id)}
                              aria-expanded={isOpen}
                              aria-controls={`trav-detail-${item.id}`}
                            >
                              {isOpen ? 'Hide details' : 'Why this matters'}
                            </button>
                          )}
                          {item.crossLink && (
                            <button
                              type="button"
                              className="trav-crosslink"
                              onClick={() => onNavigate(item.crossLink.tool)}
                            >
                              {item.crossLink.label} &rarr;
                            </button>
                          )}
                          {item.link && (
                            <a
                              className="trav-crosslink"
                              href={item.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.link.label} &#8599;
                            </a>
                          )}
                        </div>

                        {item.detail && (
                          <p
                            id={`trav-detail-${item.id}`}
                            className={`trav-item-detail${isOpen ? '' : ' trav-detail-hidden'}`}
                          >
                            {item.detail}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </TabPanel>
        );
      })}

      {/* Emergency contacts — deliberately outside the tabs, since this is the
          one thing a traveller in trouble should not have to hunt for. */}
      <section className="trav-emergency">
        <h2 className="trav-emergency-title">{travelSecurityData.emergency.title}</h2>
        <p className="trav-emergency-body">{travelSecurityData.emergency.body}</p>
        <ul className="trav-contact-list">
          {travelSecurityData.emergency.contacts.map(c => (
            <li key={c.id} className="trav-contact">
              <span className="trav-contact-label">{c.label}</span>
              <span className="trav-contact-detail">{c.detail}</span>
              <span className="trav-contact-links">
                {c.phone && <a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`}>{c.phone}</a>}
                {c.phone && c.email && <span aria-hidden="true"> &middot; </span>}
                {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="trav-training">
        <h2 className="trav-training-title">{travelSecurityData.training.label}</h2>
        <p>{travelSecurityData.training.body}</p>
        <a
          className="trav-crosslink"
          href={travelSecurityData.training.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Safeguarding Science workshops &#8599;
        </a>
      </section>

      <div className="checklist-actions trav-no-print">
        <button className="checklist-print-btn" onClick={() => window.print()}>
          Print checklist
        </button>
        <button className="checklist-reset-btn" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
