import { useAssessment } from '../../state/useAssessment';
import { policySources } from '../../data/policySources';

export default function SupportLinks() {
  const { state } = useAssessment();
  return <aside className="support-links" aria-label="Further help">
    <strong>{state.institution === 'lakehead' ? 'Lakehead support' : 'Your institution and funder'}</strong>
    {state.institution === 'lakehead' ? <p><a href={policySources.lakeheadHelp.url} target="_blank" rel="noopener noreferrer">Research security and grants support</a>{' · '}
      <a href={policySources.lakeheadRdm.url} target="_blank" rel="noopener noreferrer">RDM and data governance</a>{' · '}
      <a href={policySources.lakeheadCyber.url} target="_blank" rel="noopener noreferrer">IT and cybersecurity</a>{' · '}<a href={policySources.lakeheadReb.url} target="_blank" rel="noopener noreferrer">REB online-tools guidance</a></p> :
      <p>Use your institution’s research security, grants, IT, privacy and ethics processes for case-specific decisions. <a href={policySources.nsgrp.url} target="_blank" rel="noopener noreferrer">Federal guidance and funder contacts</a></p>}
    <p>Published support links do not imply endorsement of this toolkit.</p>
  </aside>;
}
