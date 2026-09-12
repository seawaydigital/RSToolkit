import FlowchartFullView from './FlowchartFullView';
import FlowchartGuidedMode from './FlowchartGuidedMode';
import SourceNote from './SourceNote';
import SupportLinks from './SupportLinks';
import { useAssessment } from '../../state/useAssessment';
import { useSourceCurrency } from '../../hooks/useSourceCurrency';
import { validHistory } from '../../lib/flow';

export default function FlowchartViewer({ data, onNavigate }) {
  const { state, update } = useAssessment();
  const current = useSourceCurrency(data.sourceIds);
  const saved = state.flows[data.id];
  const compatible = saved?.version === data.contentVersion && validHistory(data, saved.history);
  const flow = compatible ? saved : { mode: 'guided', history: ['start'], version: data.contentVersion };
  function change(patch) { update({ flows: { ...state.flows, [data.id]: { ...flow, ...patch } } }); }
  return <div>
    <SourceNote ids={data.sourceIds} />
    <p className="notice">Your answers guide a policy-specific preparation path. They do not establish funding approval or overall compliance.</p>
    {saved && !compatible && <p role="status">The previous path used different content or invalid steps. Start this version again.</p>}
    {!current ? <p className="notice" role="status">This walkthrough is awaiting source review. Use the official instructions above; definitive toolkit outcomes are unavailable.</p> :
      <>
        <div className="flowchart-toggle" aria-label="Walkthrough display">
          <button className={'flowchart-toggle-btn ' + (flow.mode === 'guided' ? 'flowchart-toggle-btn--active' : '')} aria-pressed={flow.mode === 'guided'} onClick={() => change({ mode: 'guided' })}>Guided Mode</button>
          <button className={'flowchart-toggle-btn ' + (flow.mode === 'full' ? 'flowchart-toggle-btn--active' : '')} aria-pressed={flow.mode === 'full'} onClick={() => change({ mode: 'full' })}>Full View</button>
        </div>
        {flow.mode === 'full' ? <FlowchartFullView data={data} onNavigate={onNavigate} /> :
          <FlowchartGuidedMode data={data} history={flow.history} setHistory={history => change({ history })} onNavigate={onNavigate} />}
      </>}
    <SupportLinks />
  </div>;
}
