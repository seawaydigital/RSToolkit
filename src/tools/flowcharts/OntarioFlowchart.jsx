import FlowchartViewer from '../../components/ui/FlowchartViewer';
import { ontarioFlow } from '../../data/flowcharts/ontarioFlow';

export default function OntarioFlowchart({ onNavigate }) {
  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Ontario RS Guidelines Flowchart</h1>
        <p>Ontario Research Security Guidelines decision flow</p>
      </div>
      <FlowchartViewer data={ontarioFlow} onNavigate={onNavigate} />
    </div>
  );
}
