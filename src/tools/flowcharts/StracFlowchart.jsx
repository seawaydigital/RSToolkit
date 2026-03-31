import FlowchartViewer from '../../components/ui/FlowchartViewer';
import { stracFlow } from '../../data/flowcharts/stracFlow';

export default function StracFlowchart({ onNavigate }) {
  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>STRAC Policy Flowchart</h1>
        <p>Interactive decision flow for the Policy on Sensitive Technology Research and Affiliations of Concern</p>
      </div>
      <FlowchartViewer data={stracFlow} onNavigate={onNavigate} />
    </div>
  );
}
