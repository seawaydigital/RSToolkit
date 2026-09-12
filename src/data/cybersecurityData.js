export const cybersecurityData = {
 id: 'cybersecurity', title: 'Cybersecurity for Research',
 summary: 'Practical safeguards with account, device and data-classification boundaries. Check published institutional instructions for your environment.',
 sourceIds: ['cyber', 'lakeheadCyber'],
 sections: [
  { id: 'basics', title: 'Protect access and recovery', items: [
   { id: 'updates', title: 'Use supported software and security updates', text: 'Follow managed-device update policies. Keep operating systems, browsers and research software supported and patched. Identify who owns updates for lab equipment whose software cannot be changed routinely.', sourceIds: ['cyber'] },
   { id: 'mfa', title: 'Use the institution’s supported MFA and password tools', text: 'Enable the supported authentication methods, use unique credentials and keep recovery arrangements protected. This toolkit does not establish Lakehead entitlement to a password manager or prescribe a universal Duo/Google configuration.', sourceIds: ['cyber', 'lakeheadCyber'] },
   { id: 'access', title: 'Limit and review access', text: 'Grant access appropriate to the work. Remove access when roles change, protect administrator accounts and agree on approved remote-access methods. A VPN is not permission to use an otherwise unapproved service.', sourceIds: ['cyber'] },
   { id: 'backups', title: 'Test restoration as well as backup creation', text: 'Use the approved backup service and verify restoration with non-sensitive test files. Keep recovery material in the institutionally designated location. Do not assume a personal cloud account is an acceptable recovery store.', sourceIds: ['cyber', 'lakeheadCyber'] },
   { id: 'incident', title: 'Report suspected incidents promptly', text: 'Use the published institutional reporting process. Do not delay urgent reporting to finish a private investigation. Preserve relevant information safely and follow the incident handler’s instructions; avoid posting sensitive cases publicly.', sourceIds: ['cyber', 'lakeheadCyber'] },
  ] },
  { id: 'encryption', title: 'Encrypt using a supported procedure', items: [
   { id: 'files', title: 'Confirm format, recipients and recovery', text: 'A password prompt alone does not establish strong encryption. Select a documented method supported by the institution and recipient, and test opening and recovery with synthetic files. Keep the recovery secret separate from the transfer.', sourceIds: ['cyber', 'appleEncryption'] },
   { id: 'mac', title: 'macOS: Apple’s encrypted disk-image procedure', text: 'Apple documents how to create an encrypted disk image in Disk Utility. Follow the procedure for the installed macOS version and confirm institutional suitability. The password is needed to open the image. This release links to the vendor procedure; it does not claim a locally tested Mac workflow.', sourceIds: ['appleEncryption'] },
   { id: 'managed', title: 'Managed device encryption', text: 'Use the supported institutional device-encryption configuration and recovery process. Check recovery before changing encryption settings. Do not disable managed protections or move organizational recovery keys to a personal account.', sourceIds: ['cyber', 'lakeheadCyber'] },
  ] },
  { id: 'data', title: 'Classify data before choosing a service', items: [
   { id: 'residency', title: 'Storage location is one requirement among several', text: 'Identify the applicable institutional policy, jurisdiction, agreement, funder and consent/ethics commitments. Canadian hosting alone does not establish compliance. PIPEDA is not a universal ban on foreign processing, and its scope does not cover every public-sector university activity.', sourceIds: ['privacy', 'lakeheadRdm'] },
   { id: 'retention', title: 'Use the applicable retention and disposal schedule', text: 'There is no universal seven-year timer in this toolkit. Establish the governing records, funder, agreement, ethics and disciplinary requirements. Document retention, access, legal holds where applicable and secure disposal through the approved process.', sourceIds: ['lakeheadRdm'] },
   { id: 'indigenous', title: 'Respect community-specific data governance', text: 'OCAP concerns First Nations ownership, control, access and possession. It must not stand in for Inuit, Métis or a particular community’s own governance and agreements. A checklist does not supply community consent or authority.', sourceIds: ['ocap', 'lakeheadRdm'] },
   { id: 'ai', title: 'AI and online research services depend on the account and agreement', text: 'Check permitted data, institutional account terms, retention, access and participant commitments before submitting information. An enterprise label does not approve every dataset. For human-participant work at Lakehead, consult the published online-tools and REB guidance.', sourceIds: ['lakeheadReb', 'lakeheadRdm'] },
  ] },
 ],
};
