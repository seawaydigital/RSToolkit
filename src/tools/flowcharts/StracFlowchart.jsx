import FlowchartViewer from '../../components/ui/FlowchartViewer';
import { stracFlow } from '../../data/flowcharts/stracFlow';
export default function StracFlowchart({ onNavigate }) {
 return <div className="tool-page tool-page--wide">
  <header className="tool-page-header"><h1>STRAC Policy Flowchart</h1><p>Check competition scope, research advancement, connections and attesting roles separately.</p></header>
  <FlowchartViewer data={stracFlow} onNavigate={onNavigate} />
 </div>;
}
