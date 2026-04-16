import FlowchartViewer from '../../components/ui/FlowchartViewer';
import { stracFlow } from '../../data/flowcharts/stracFlow';

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

      {/* Why This Policy Exists */}
      <div className="strac-overview">
        <h2 className="strac-overview-heading">Why This Policy Exists</h2>
        <p className="strac-overview-intro">
          Canadian universities produce world-class research in areas that have real national security implications — things like advanced AI, quantum computing, and space technology. Some foreign institutions connected to military or state intelligence programs actively seek to access that research. In some cases, they do it through legitimate-looking academic partnerships.
        </p>
        <p className="strac-overview-intro">
          The STRAC Policy is the federal government's response to that risk. It doesn't restrict who you can collaborate with in general — it targets one specific combination:{' '}
          <strong>sensitive research + a connection to a listed institution of concern</strong>. That combination is what triggers the compliance requirement.
        </p>
        <p className="strac-overview-intro strac-overview-intro--last">
          The policy applies to all NSERC, SSHRC, CIHR, and CFI grant applications as of the 2025–26 competition cycle.
        </p>
      </div>

      {/* How It Works: Two Sequential Gates */}
      <div className="strac-overview">
        <h2 className="strac-overview-heading">How It Works: Two Sequential Gates</h2>
        <p className="strac-overview-intro">
          STRAC operates as two linked decision points. You only move to the second gate if you pass through the first.
        </p>
        <ol className="strac-overview-steps">

          {/* Gate 1 */}
          <li className="strac-overview-step">
            <div className="strac-overview-step-num">1</div>
            <div className="strac-overview-step-content">
              <strong>Check if your research advances a STRA</strong>
              <p>
                The federal government maintains a list of Sensitive Technology Research Areas — specific sub-categories of research domains considered sensitive for national security purposes. Examples include advanced AI systems, quantum science, space technology, and certain areas of biology and chemistry.
              </p>
              <p>
                <strong>Check whether your proposed research advances any item on that list — not just the general domain, but the specific sub-categories.</strong>
              </p>
              <ul className="strac-overview-bullets">
                <li>If <strong>no</strong>: STRAC does not apply to your grant. No further action required.</li>
                <li>If <strong>yes</strong>: Your grant is a qualifying grant and you must proceed to Gate 2.</li>
              </ul>
            </div>
          </li>

          {/* Gate 2 */}
          <li className="strac-overview-step">
            <div className="strac-overview-step-num">2</div>
            <div className="strac-overview-step-content">
              <strong>Check all researcher affiliations against the NRO list</strong>
              <p>
                Every researcher with a named role on a qualifying grant — applicants, co-applicants, and collaborators — must be checked against the Named Research Organizations (NRO) list. This list identifies universities, research institutes, and laboratories connected to foreign military, national defence, or state security programs that pose a risk to Canada's national security.
              </p>
              <p><strong>Affiliation means any of the following:</strong></p>
              <ul className="strac-overview-bullets">
                <li>Being employed at the organization</li>
                <li>Holding an appointment there</li>
                <li>Actively conducting research there</li>
              </ul>
              <p className="strac-overview-note">
                Receiving funding or in-kind support (equipment, lab access, software, facilities) from a listed NRO also counts.
              </p>
            </div>
          </li>

          {/* Resolve */}
          <li className="strac-overview-step">
            <div className="strac-overview-step-num">3</div>
            <div className="strac-overview-step-content">
              <strong>Resolve affiliations and proceed</strong>
              <div className="strac-outcome-paths">
                <div className="strac-outcome strac-outcome--pass">
                  <span className="strac-outcome-label strac-outcome-label--pass">No NRO affiliation</span>
                  <p>The grant proceeds. All researchers with named roles must complete an attestation.</p>
                </div>
                <div className="strac-outcome strac-outcome--flag">
                  <span className="strac-outcome-label strac-outcome-label--flag">NRO affiliation found</span>
                  <p>There are only two options — the researcher terminates the NRO affiliation before the grant proceeds, or the researcher is removed from the grant application. There are no exceptions or case-by-case exemptions. Once resolved, the grant proceeds normally.</p>
                </div>
              </div>
            </div>
          </li>

          {/* Attestation */}
          <li className="strac-overview-step">
            <div className="strac-overview-step-num">4</div>
            <div className="strac-overview-step-content">
              <strong>Complete the attestation</strong>
              <p>
                Every researcher with a named role on a qualifying grant must sign an attestation form confirming they are not affiliated with, and are not receiving funding or in-kind support from, any NRO. This is not a one-time checkbox at application — compliance must be maintained for the full duration of the grant. If the research changes scope or the team composition changes, the attestation obligations are revisited.
              </p>
              <p className="strac-overview-note">
                Non-compliance with STRAC is treated as a breach of the Tri-Agency Framework on Responsible Conduct of Research.
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* What This Policy Does Not Do */}
      <div className="strac-overview">
        <h2 className="strac-overview-heading">What This Policy Does Not Do</h2>
        <ul className="strac-overview-bullets strac-overview-bullets--standalone">
          <li>It does <strong>not</strong> restrict collaboration with international researchers broadly</li>
          <li>It does <strong>not</strong> target researchers based on nationality, ethnicity, or country of origin</li>
          <li>It does <strong>not</strong> apply to research that doesn't touch a listed STRA sub-category — even if your field sounds adjacent</li>
        </ul>
        <p className="strac-overview-intro strac-overview-intro--last">
          The policy is deliberately narrow. The concern is the intersection of sensitive research and specific institutional connections, not international collaboration itself.
        </p>
        <p className="strac-overview-tip">
          <strong>Tip:</strong> Click any node in the flowchart below to see its policy details.
          Decision diamonds link directly to the STRA Lookup and NRO Lookup tools.
        </p>
      </div>

      <FlowchartViewer data={stracFlow} onNavigate={onNavigate} />
    </div>
  );
}
