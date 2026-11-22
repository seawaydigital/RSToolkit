// Facts behind Sanctions Screening (OpenSanctions bulk screening and its
// list builder). lastUpdated is the date the API's behaviour was
// last checked against the live service, not an edit date.
export const screeningData = {
  lastUpdated: '2026-10-30',
  sourceUrl: 'https://api.opensanctions.org/docs',
  sourceLabel: 'OpenSanctions API documentation',
  keyUrl: 'https://www.opensanctions.org/api/',
  siteUrl: 'https://www.opensanctions.org/',
  // Checked 2026-10-30. OpenSanctions counts compliance screening as
  // commercial use even when it earns nothing; its free keys are for
  // journalists, public-interest groups and researchers studying sanctions.
  useUrl: 'https://www.opensanctions.org/docs/commercial/exemption/',
  termsUrl: 'https://www.opensanctions.org/docs/terms/api/202609/',
  // What happens to screened names: held in memory only, never logged;
  // request logs (with IP addresses) kept 90 days; a billing record per
  // query, without its content, kept three years.
  apiFaqUrl: 'https://www.opensanctions.org/docs/api/faq/',
  licenceUrl: 'https://creativecommons.org/licenses/by-nc/4.0/',
  // Global Affairs Canada's lists are the legal reference for Canadian
  // sanctions obligations; OpenSanctions is an aggregator.
  gacSanctionsUrl: 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx',
  gacAcademicUrl: 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/academic-research-universitaire-recherche.aspx?lang=eng',
};
