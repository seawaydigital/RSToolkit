export const CONTENT_VERSION = '2026-09-12.1';
export const VERIFIED_ON = '2026-09-12';
export const REVIEW_DUE = '2026-10-12';
const science = 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/';
const strac = science + 'sensitive-technology-research-and-affiliations-concern/';
const entry = (title, url, section, version = null) => ({ title, url, section, version, verifiedOn: VERIFIED_ON, reviewDue: REVIEW_DUE });

export const policySources = {
  ecl: entry('Guide to Canada’s Export Control List', 'https://www.international.gc.ca/trade-commerce/controls-controles/ecl-lec/index.aspx?lang=eng', 'Select the applicable guide and item-level technical parameters'),
  nsgrp: entry('Tri-agency NSGRP implementation', 'https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-guidance', 'About; funding opportunities; frequently asked questions', '2026-03-27'),
  nsgrpFramework: entry('National Security Guidelines for Research Partnerships', science + 'national-security-guidelines-research-partnerships', 'Risk assessment, Annex A and Annex B'),
  raf: entry('Official Risk Assessment Form', science + 'national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form', 'Use the form and current competition instructions'),
  strac: entry('STRAC implementation guidance', 'https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-0', 'Applicability, attestations and ongoing responsibilities'),
  stracFaq: entry('Official STRAC questions and answers', strac + 'frequently-asked-questions-faq-policy-sensitive-technology-research-and-affiliations-concern', 'Questions 1–5, 9, 11–20'),
  nro: entry('Official Named Research Organizations list', strac + 'named-research-organizations', 'Organization entries and known aliases; list read on verification date'),
  stra: entry('Official Sensitive Technology Research Areas', strac + 'sensitive-technology-research-areas', 'Categories and subcategories'),
  ontario: entry('Ontario research security guidelines', 'https://forms.mgcs.gov.on.ca/dataset/875d7629-9ddc-4545-a1c3-881ece0cb3a3/resource/6219fff3-aa2e-49ae-955c-0ebbd21059f1/download/on00708e.pdf', 'Definitions pp. 2–3; application stage pp. 4–5', '2024-06'),
  ontarioForms: entry('Ontario guidelines and forms catalogue', 'https://forms.mgcs.gov.on.ca/en/dataset/on00708', 'Check the version required for your competition'),
  exports: entry('Export and brokering controls handbook', 'https://www.international.gc.ca/trade-commerce/controls-controles/reports-rapports/ebc_handbook-cce_manuel.aspx?lang=eng', 'Controlled technology, intangible transfers and permits'),
  goods: entry('Controlled Goods Program exemptions', 'https://www.canada.ca/en/public-services-procurement/services/industrial-security/controlled-goods/about-program/program-registration-exemptions.html', 'Exclusions, exemptions and security assessments'),
  sanctions: entry('Canadian sanctions: academic and research guidance', 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/academic-research-universitaire-recherche.aspx?lang=eng', 'Overview and due diligence'),
  privacy: entry('Privacy Commissioner: processing across borders', 'https://www.priv.gc.ca/en/privacy-topics/airports-and-borders/gl_dab_090127/?wbdisable=true', 'PIPEDA scope, accountability and cross-border processing'),
  ocap: entry('First Nations Information Governance Centre: OCAP', 'https://fnigc.ca/ocap-training/', 'First Nations ownership, control, access and possession'),
  lakeheadRdm: entry('Lakehead Research Data Management', 'https://www.lakeheadu.ca/research-and-innovation/research-services/resources/research-data-management', 'Local policies, data classification and support'),
  lakeheadHelp: entry('Lakehead research support directory', 'https://www.lakeheadu.ca/research-and-innovation/support', 'Published institutional contact routes'),
  lakeheadCyber: entry('Lakehead cybersecurity resources for researchers', 'https://www.lakeheadu.ca/research-and-innovation/research-services/resources/safeguarding-research-resources/cybersecurity', 'Local support and institutional guidance; account-specific instructions must be confirmed'),
  lakeheadReb: entry('Lakehead: online tools and human-participant research', 'https://www.lakeheadu.ca/sites/default/files/uploads/111/Guideline%20-%20Use%20of%20online%20tools%20for%20research%20involving%20human%20participants%2C%20REVISED%202026.pdf', 'Institutional accounts, agreements and participant information', '2026'),
  cyber: entry('Canadian Centre for Cyber Security: baseline controls', 'https://www.cyber.gc.ca/en/guidance/baseline-cyber-security-controls-small-and-medium-organizations', 'Updates, access, training, backups and incident response'),
  appleEncryption: entry('Apple: encrypted disk images', 'https://support.apple.com/en-ca/guide/disk-utility/dskutl11888/mac', 'Creating an encrypted disk image; protect the password'),
};

export function sourcesCurrent(ids, now = new Date()) {
  const date = new Date(now).getTime();
  return Number.isFinite(date) && ids.length > 0 && ids.every(id => {
    const source = policySources[id];
    return source && date >= Date.parse(source.verifiedOn + 'T00:00:00Z') && date <= Date.parse(source.reviewDue + 'T23:59:59Z');
  });
}
