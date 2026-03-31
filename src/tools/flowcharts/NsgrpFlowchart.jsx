import FlowchartViewer from '../../components/ui/FlowchartViewer';
import { nsgrpFlow } from '../../data/flowcharts/nsgrpFlow';

export default function NsgrpFlowchart({ onNavigate }) {
  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>NSGRP Flowchart</h1>
        <p>National Security Guidelines for Research Partnerships decision flow</p>
      </div>
      <FlowchartViewer data={nsgrpFlow} onNavigate={onNavigate} />
    </div>
  );
}
