import { riskChecklist } from '../../data/riskChecklist';
import { summarizeAnswers } from '../../lib/assessment';
import { useAssessment } from '../../state/useAssessment';
import SourceNote from '../../components/ui/SourceNote';
import SupportLinks from '../../components/ui/SupportLinks';
import PrintMeta from '../../components/ui/PrintMeta';
const labels = { risk: 'Concern or risk identified', 'no-risk': 'No concern identified from information reviewed', unknown: 'Unknown / needs information', na: 'Not applicable to this worksheet' };
const items = riskChecklist.sections.flatMap(s => s.items);
export default function RiskChecklist() {
 const { state, update, remember, enableRemember, saved, status, startNew, clearSaved, resume, canUndo, undoReset } = useAssessment();
 const summary = summarizeAnswers(items, state.answers);
 function answer(id, value) { update({ answers: { ...state.answers, [id]: value } }); }
 return <div className="tool-page">
  <header className="tool-page-header"><h1>Research Security Preparation Worksheet</h1><p>Organize what you have reviewed and what remains unresolved. Use the official form for a required submission.</p><SourceNote ids={['raf', 'nsgrp']} /></header>
  <PrintMeta assessment={state} />
  <div className="review-card">
   <h2>Worksheet status</h2>
   <p><strong>{summary.answered} of {summary.total} topics answered</strong> · {summary.risks} concerns · {summary.unknown} unknown · {summary.unanswered} unanswered</p>
   <p>Answering every topic does not mean risks are acceptable or that your application is approved.</p>
   <p>Worksheet ID: <span className="worksheet-id">{state.id}</span></p>
  </div>
  <div className="review-card screen-only">
   <div className="toolbar"><button onClick={startNew}>New blank worksheet</button>{canUndo && <button onClick={undoReset}>Undo worksheet replacement</button>}<button onClick={() => window.print()}>Print worksheet</button></div>
   <label className="choice-label"><input type="checkbox" checked={remember} onChange={e => enableRemember(e.target.checked)} />Remember this worksheet on this device</label>
   <p>Off by default. Enabling saving replaces the earlier saved worksheet on this device. Guided paths and STRA exploration remain temporary. Browser storage is not encrypted by this toolkit. Avoid saving on shared devices.</p>
   {saved && <button onClick={resume}>Resume saved worksheet</button>}{' '}<button onClick={clearSaved}>Clear saved data</button>
   <p role="status">{status}</p>
  </div>
  {riskChecklist.sections.map(section => <section key={section.id} className="checklist-section"><h2>{section.title}</h2>{section.items.map(item => <fieldset className="review-card" key={item.id}>
   <legend>{item.label}</legend><p>{item.prompt}</p>
   <div className="screen-only answer-options">{Object.entries(labels).map(([value, label]) => <label className="choice-label" key={value}><input type="radio" name={item.id} checked={state.answers[item.id] === value} onChange={() => answer(item.id, value)} />{label}</label>)}</div>
   <p className="print-only"><strong>Response: {labels[state.answers[item.id]] || 'Unanswered'}</strong></p>
   <SourceNote ids={item.sourceIds} />
  </fieldset>)}</section>)}
  <SupportLinks />
 </div>;
}
