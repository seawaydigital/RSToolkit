import FlowchartViewer from '../../components/ui/FlowchartViewer';
import { stracFlow } from '../../data/flowcharts/stracFlow';

const STEPS = [
  {
    n: 1,
    heading: 'Check if your research advances a STRA',
    body: 'Sensitive Technology Research Areas (STRAs) are research domains with national security implications — e.g. advanced AI, quantum science, space technology. If your research does not advance any STRA, no further compliance action is required.',
  },
  {
    n: 2,
    heading: 'Check all researcher affiliations against the NRO list',
    body: 'If a STRA is involved, every researcher on the grant — applicants, co-applicants, and collaborators — must be checked against the Named Research Organizations (NRO) list. NROs are institutions linked to foreign state military, national security, or intelligence programs.',
  },
  {
    n: 3,
    heading: 'Resolve any NRO affiliation before proceeding',
    body: 'If any researcher is employed by, appointed at, or conducting research at a listed NRO, they must either terminate that connection or be removed from the grant application. There are no exemptions.',
  },
  {
    n: 4,
    heading: 'Complete the attestation',
    body: 'All researchers on qualifying grants must attest in writing that they comply with the policy. This is an ongoing obligation — compliance must be maintained for the duration of the grant.',
  },
];

export default function StracFlowchart({ onNavigate }) {
  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>STRAC Policy Flowchart</h1>
        <p>Interactive decision flow for the Policy on Sensitive Technology Research and Affiliations of Concern</p>
        <div className="tool-page-meta">
          <span>In effect from the 2025–26 grant competition cycle</span>
          <span>Applies to NSERC, SSHRC, CIHR, and CFI funding</span>
        </div>
      </div>

      {/* Policy overview */}
      <div className="strac-overview">
        <h2 className="strac-overview-heading">How the policy works</h2>
        <p className="strac-overview-intro">
          The STRAC Policy adds two compliance checks to any Tri-Agency or CFI grant application.
          Both checks must pass before a grant can proceed — the flowchart below walks through every decision point.
        </p>
        <ol className="strac-overview-steps">
          {STEPS.map(({ n, heading, body }) => (
            <li key={n} className="strac-overview-step">
              <div className="strac-overview-step-num">{n}</div>
              <div className="strac-overview-step-content">
                <strong>{heading}</strong>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="strac-overview-tip">
          <strong>Tip:</strong> Click any node in the flowchart below to see its policy details.
          Decision diamonds link directly to the STRA Lookup and NRO Lookup tools.
        </p>
      </div>

      <FlowchartViewer data={stracFlow} onNavigate={onNavigate} />
    </div>
  );
}
