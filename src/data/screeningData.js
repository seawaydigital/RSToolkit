// Facts behind Sanctions Screening (OpenSanctions bulk screening and its
// list builder). lastUpdated is the date the API's behaviour was
// last checked against the live service, not an edit date.
export const screeningData = {
  lastUpdated: '2026-10-29',
  sourceUrl: 'https://api.opensanctions.org/docs',
  sourceLabel: 'OpenSanctions API documentation',
  keyUrl: 'https://www.opensanctions.org/api/',
  siteUrl: 'https://www.opensanctions.org/',
  // Global Affairs Canada's lists are the legal reference for Canadian
  // sanctions obligations; OpenSanctions is an aggregator.
  gacSanctionsUrl: 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx',
  gacAcademicUrl: 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/academic-research-universitaire-recherche.aspx?lang=eng',
};
