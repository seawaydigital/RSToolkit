// Only statuses recorded here may be exposed by the route boundary.
// Candidate status is honest: ownership, real-device acceptance and production verification remain separate.
export const releaseStatus = {
  version: '0.1.0-rc.1',
  stage: 'Release candidate',
  disabledTools: [],
  operator: null,
  reportingEmail: 'security.research@lakeheadu.ca',
  institutionalEndorsement: false,
};
