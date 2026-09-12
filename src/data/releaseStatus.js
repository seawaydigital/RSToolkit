// Only statuses recorded here may be exposed by the route boundary.
// Candidate status is honest: ownership, real-device acceptance and production verification remain separate.
const containment = import.meta.env.VITE_CONTAINMENT === '1';
export const releaseStatus = {
  containment,
  version: '0.1.0-rc.1',
  stage: 'Release candidate',
  disabledTools: [...['dual-use', 'travel-security', 'report-concern'], ...(containment ? ['tri-agency-guide', 'nsgrp-flowchart', 'strac-flowchart', 'ontario-flowchart', 'stra-lookup', 'nro-lookup', 'risk-checklist', 'risk-mitigation', 'export-control', 'glossary', 'faq', 'cybersecurity-guide'] : [])],
  operator: 'Andrew Austin at Lakehead University',
  reportingEmail: 'security.research@lakeheadu.ca',
  institutionalEndorsement: false,
};
