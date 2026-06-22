import { useState } from 'react';
import { dualUseData } from '../../data/dualUseData';
import { dualUseWizard } from '../../data/dualUseWizard';

const TABS = [
  { id: 'assess', label: 'Self-Assessment' },
  { id: 'areas', label: 'Dual-Use Areas' },
  { id: 'vetting', label: 'Vetting Collaborators' },
  { id: 'diligence', label: 'Due Diligence' },
];

const SIGNAL_META = {
  likely: { label: 'Likely dual-use', className: 'dual-signal--likely', glyph: '!' },
  possible: { label: 'Possible dual-use', className: 'dual-signal--possible', glyph: '?' },
  low: { label: 'Low signal', className: 'dual-signal--low', glyph: '✓' },
};

// Given a question node id and the next node id chosen, return the human label
// of the answer the user picked (for the printable trail).
function answerLabelFor(qId, nextId) {
  const q = dualUseWizard.questions[qId];
  if (!q) return '';
  if (q.type === 'yesno') return nextId === q.yes ? 'Yes' : 'No';
  if (q.type === 'choice') {
    const opt = q.options.find(o => o.next === nextId);
    return opt ? opt.label : '';
  }
  return '';
}

export default function DualUseGuide({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('assess');
  const [history, setHistory] = useState([dualUseWizard.startQuestion]);

  const currentId = history[history.length - 1];
  const currentNode = dualUseWizard.questions[currentId];

  function go(nextId) {
    if (!nextId) return;
    setHistory(prev => [...prev, nextId]);
  }
  function back() {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }
  function restart() {
    setHistory([dualUseWizard.startQuestion]);
  }

  // Build the answered-question trail (everything except the final result node)
  const trail = history.slice(0, -1).map((qId, i) => ({
    question: dualUseWizard.questions[qId].text,
    answer: answerLabelFor(qId, history[i + 1]),
  }));

  function renderNextStep(step, i) {
    if (step.tool) {
      return (
        <button key={i} className="dual-nextstep-btn" onClick={() => onNavigate(step.tool)}>
          {step.label} &rarr;
        </button>
      );
    }
    // No tool: route to the Areas tab within this guide
    return (
      <button key={i} className="dual-nextstep-btn" onClick={() => setActiveTab('areas')}>
        {step.label} &rarr;
      </button>
    );
  }

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Dual-Use Research Guide</h1>
        <p>Identify dual-use research, vet collaborators, and run due diligence &mdash; Know Your Research, Know Your Partners, Assess the Risk.</p>
        <div className="tool-page-meta">
          <span>Last updated: {dualUseData.lastUpdated}</span>
          <a href={dualUseData.sourceUrl} target="_blank" rel="noopener noreferrer">
            {dualUseData.sourceLabel}
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="dual-tabs dual-no-print">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`dual-tab${activeTab === tab.id ? ' dual-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Self-Assessment */}
      {activeTab === 'assess' && (
        <div className="dual-tab-content">
          <section className="dual-howitworks dual-no-print" aria-label="How this assessment works">
            <h3 className="dual-howitworks-summary">How this assessment works</h3>
            <div className="dual-howitworks-body">
              <p className="dual-howitworks-intro">{dualUseData.assessmentLogic.intro}</p>

              <h4 className="dual-howitworks-head">The questions and how they route</h4>
              <ol className="dual-howitworks-steps">
                {dualUseData.assessmentLogic.steps.map(s => (
                  <li key={s.n}>
                    <span className="dual-howitworks-q">{s.q}</span>
                    <span className="dual-howitworks-routing">{s.routing}</span>
                  </li>
                ))}
              </ol>

              <h4 className="dual-howitworks-head">What the result means</h4>
              <ul className="dual-howitworks-signals">
                {dualUseData.assessmentLogic.signals.map(s => (
                  <li key={s.level}>
                    <strong>{s.level}.</strong> {s.meaning}
                  </li>
                ))}
              </ul>

              <h4 className="dual-howitworks-head">Limitations</h4>
              <ul className="dual-howitworks-limits">
                {dualUseData.assessmentLogic.limitations.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
          </section>

          {currentNode.type !== 'result' ? (
            <div className="dual-wizard">
              <div className="dual-wizard-progress dual-no-print">Step {history.length}</div>
              <h2 className="dual-wizard-question">{currentNode.text}</h2>
              <div className="guided-buttons dual-no-print">
                {history.length > 1 && (
                  <button className="guided-btn guided-btn--back" onClick={back}>Back</button>
                )}
                {currentNode.type === 'yesno' && (
                  <>
                    <button className="guided-btn guided-btn--yes" onClick={() => go(currentNode.yes)}>Yes</button>
                    <button className="guided-btn guided-btn--no" onClick={() => go(currentNode.no)}>No</button>
                  </>
                )}
                {currentNode.type === 'choice' && (
                  <div className="dual-choice-list">
                    {currentNode.options.map((opt, i) => (
                      <button key={i} className="dual-choice-btn" onClick={() => go(opt.next)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="dual-result">
              <div className={`dual-signal ${SIGNAL_META[currentNode.signal].className}`}>
                <span className="dual-signal-glyph">{SIGNAL_META[currentNode.signal].glyph}</span>
                <span>{SIGNAL_META[currentNode.signal].label}</span>
              </div>
              <h2 className="dual-result-title">{currentNode.title}</h2>
              <p className="dual-result-desc">{currentNode.description}</p>

              <h3 className="dual-result-subhead">Indicators flagged</h3>
              <ul className="dual-flag-list">
                {currentNode.flags.map((f, i) => <li key={i}>{f}</li>)}
              </ul>

              <h3 className="dual-result-subhead">Recommended next steps</h3>
              <div className="dual-nextsteps">
                {currentNode.nextSteps.map((s, i) => renderNextStep(s, i))}
              </div>

              <p className="dual-disclaimer">
                This is a prompt to do due diligence &mdash; not a determination or legal advice.
                Always consult your institution&apos;s Research Security office.
              </p>

              {/* Printable summary (hidden on screen, shown when printing) */}
              <div className="dual-print-summary dual-print-only">
                <h2>Dual-Use Self-Assessment Record</h2>
                <p>Generated: {new Date().toLocaleDateString('en-CA')}</p>
                <h3>Your answers</h3>
                <ol>
                  {trail.map((t, i) => (
                    <li key={i}><strong>{t.question}</strong> &mdash; {t.answer}</li>
                  ))}
                </ol>
                <h3>Result: {currentNode.title} ({SIGNAL_META[currentNode.signal].label})</h3>
                <p>{currentNode.description}</p>
                <h3>Indicators flagged</h3>
                <ul>{currentNode.flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
                <h3>Recommended next steps</h3>
                <ul>{currentNode.nextSteps.map((s, i) => <li key={i}>{s.label}</li>)}</ul>
                <p><em>Prompt to do due diligence &mdash; not a determination or legal advice. Consult your Research Security office.</em></p>
              </div>

              <div className="guided-buttons dual-no-print">
                <button className="guided-btn guided-btn--back" onClick={back}>Back</button>
                <button className="guided-btn guided-btn--continue" onClick={restart}>Start over</button>
                <button className="dual-print-btn" onClick={() => window.print()}>Print summary</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Dual-Use Areas */}
      {activeTab === 'areas' && (
        <div className="dual-tab-content">
          <div className="dual-callouts">
            {dualUseData.areaCallouts.map(c => (
              <div key={c.id} className="dual-callout">
                <strong>{c.title}</strong>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
          <div className="dual-area-grid">
            {dualUseData.areas.map(area => (
              <div key={area.id} className="dual-area-card">
                <h3 className="dual-area-name">{area.name}</h3>
                <div className="dual-area-cols">
                  <div className="dual-area-col dual-area-col--civ">
                    <span className="dual-area-col-label">Civilian uses</span>
                    <ul>{area.civilian.map((u, i) => <li key={i}>{u}</li>)}</ul>
                  </div>
                  <div className="dual-area-col dual-area-col--mil">
                    <span className="dual-area-col-label">Military / misuse</span>
                    <ul>{area.military.map((u, i) => <li key={i}>{u}</li>)}</ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="dual-nextstep-btn" onClick={() => onNavigate('stra-lookup')}>
            Check your specific area against the STRA list &rarr;
          </button>
        </div>
      )}

      {/* Tab: Vetting Collaborators */}
      {activeTab === 'vetting' && (
        <div className="dual-tab-content">
          <h2 className="dual-section-title">Red flags when vetting collaborators</h2>
          <ul className="dual-redflag-list">
            {dualUseData.redFlags.map((f, i) => <li key={i}>{f}</li>)}
          </ul>

          <h2 className="dual-section-title">Why people misuse research &mdash; MICE</h2>
          <div className="dual-mice-grid">
            {dualUseData.mice.map(m => (
              <div key={m.letter} className="dual-mice-card">
                <span className="dual-mice-letter">{m.letter}</span>
                <strong>{m.label}</strong>
                <p>{m.body}</p>
              </div>
            ))}
          </div>

          <h2 className="dual-section-title">Common myths</h2>
          <div className="dual-myth-list">
            {dualUseData.myths.map((m, i) => (
              <div key={i} className="dual-myth">
                <p className="dual-myth-claim"><strong>Myth:</strong> {m.myth}</p>
                <p className="dual-myth-reality"><strong>Reality:</strong> {m.reality}</p>
              </div>
            ))}
          </div>

          <h2 className="dual-section-title">Scenario lessons</h2>
          <div className="dual-scenario-list">
            {dualUseData.scenarioLessons.map(s => (
              <div key={s.id} className="dual-scenario">
                <h3 className="dual-scenario-title">{s.title}</h3>
                <p>{s.body}</p>
                {s.mitigations.length > 0 && (
                  <>
                    <span className="dual-scenario-sublabel">Mitigation options</span>
                    <ul>{s.mitigations.map((mit, i) => <li key={i}>{mit}</li>)}</ul>
                  </>
                )}
              </div>
            ))}
          </div>

          <button className="dual-nextstep-btn" onClick={() => onNavigate('nro-lookup')}>
            Screen names against the NRO list &rarr;
          </button>
        </div>
      )}

      {/* Tab: Due Diligence */}
      {activeTab === 'diligence' && (
        <div className="dual-tab-content">
          {dualUseData.diligence.map(group => (
            <div key={group.id} className="dual-diligence-group">
              <h2 className="dual-section-title">{group.group}</h2>
              <ul className="dual-diligence-list">
                {group.actions.map((a, i) => (
                  <li key={i} className="dual-diligence-item">
                    <span>{a.text}</span>
                    {a.link && a.link.tool && (
                      <button className="dual-diligence-link" onClick={() => onNavigate(a.link.tool)}>
                        {a.link.label} &rarr;
                      </button>
                    )}
                    {a.link && a.link.url && (
                      <a className="dual-diligence-link" href={a.link.url} target="_blank" rel="noopener noreferrer">
                        {a.link.label} &#8599;
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
