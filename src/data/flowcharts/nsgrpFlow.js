export const nsgrpFlow = {
  id: "nsgrp",
  title: "NSGRP Research Partnership Decision Flow",
  // Restructured 2026-09-18. The Risk Assessment Form (RAF) is required when
  // an application to a LISTED funding opportunity includes one or more
  // PRIVATE-SECTOR partner organizations (tri-agency implementation guidance,
  // modified 2026-03-27). Annex A (sensitive areas) and Annex B (partner risk)
  // help identify and mitigate risk; a "No" on either never waives a required
  // form. The named-researcher attestation is a STRAC Policy requirement and
  // is deliberately not part of this flow — see stracFlow.js.
  lastUpdated: "2026-09-18",
  policySource: "National Security Guidelines for Research Partnerships",
  sourceUrl: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships",
  nodes: [
    {
      id: "start",
      type: "start",
      label: "New Research Partnership Opportunity",
      description: "You are preparing a federal grant application that involves a partner organization — a company, industry association, non-profit, public body, or another institution.",
      next: "check-program"
    },
    {
      id: "check-program",
      type: "decision",
      label: "Is this a funding opportunity that requires a Risk Assessment Form?",
      description: "The tri-agency guidance names the opportunities: NSERC Alliance (including special calls and joint opportunities) and Idea to Innovation Phase II; CIHR Project Grant Program (Fall 2024 onward); SSHRC Partnership Grants Stage 2 (2025 onward), Partnership Development Grants (November 2025 onward) and Partnership Engage Grants (March 2026 onward); Canada Biomedical Research Fund Stage 2; Eddie Goldenberg Research Chairs of Canada; and Canada Impact+ Emerging Leaders. The list grows — check the current page before answering.",
      policyRef: "Tri-agency guidance — Funding opportunities subject to the RAF",
      whyItMatters: "The form is tied to specific programs. Answering from memory is the most common way to miss a required document.",
      resourceLink: { url: "https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-guidance", label: "Check the current program list" },
      yes: "check-private-partner",
      no: "recommend-voluntary"
    },
    {
      id: "check-private-partner",
      type: "decision",
      label: "Does the application include a private-sector partner organization?",
      description: "Private-sector partner organizations are for-profit organizations (excluding Canadian Crown corporations) and bodies that represent for-profit organizations, such as an industry association or a formal or informal consortium — but not producer groups. A foreign company counts. Partnerships whose only partners are universities, hospitals, governments or non-profits do not trigger the form.",
      policyRef: "Tri-agency guidance — Private sector partner organizations subject to the RAF",
      whyItMatters: "This is the second half of the trigger. Program plus private-sector partner means the form is mandatory, whatever you believe the risk to be.",
      yes: "raf-required",
      no: "recommend-voluntary"
    },
    {
      id: "recommend-voluntary",
      type: "end",
      label: "No Risk Assessment Form required for this application",
      description: "This application does not require the form. The Government of Canada still encourages every researcher to apply the NSGRP with any partner or funder: review Annex A (sensitive research areas) and Annex B (partner risk factors), document what you found, and manage any risks through your institution's research security office. If your research is in a Sensitive Technology Research Area, the STRAC Policy applies separately.",
      policyRef: "NSGRP — Implementation",
      crossLink: { tool: "strac-flowchart", label: "Check the STRAC Policy" }
    },
    {
      id: "raf-required",
      type: "action",
      label: "A Risk Assessment Form is required",
      description: "The form is an integral part of the application and is reviewed case by case. \"No risks identified\" is a legitimate answer — but the completed form must still be submitted. The steps below help you fill it in well; none of them removes the requirement.",
      policyRef: "Tri-agency guidance — Application requirements",
      next: "check-sensitive-area"
    },
    {
      id: "check-sensitive-area",
      type: "decision",
      label: "Does the research involve a sensitive area (Annex A)?",
      description: "Annex A lists research areas covered by export controls, the Sensitive Technology Research Areas, and additional areas that can be sensitive: critical minerals, critical infrastructure, large datasets, and sensitive personal data.",
      policyRef: "NSGRP — Annex A",
      whyItMatters: "Sensitivity of the research determines how much mitigation the form should describe. It does not decide whether the form is needed.",
      crossLink: { tool: "stra-lookup", label: "Open STRA Lookup" },
      yes: "check-partner-risk",
      no: "document-no-risk"
    },
    {
      id: "check-partner-risk",
      type: "decision",
      label: "Does the partner present risk factors (Annex B)?",
      description: "Consider whether the partner is state-owned or state-influenced, lacks institutional autonomy, operates under laws that compel knowledge transfer to a foreign government, has personnel with military or state-security ties, or has been sanctioned.",
      policyRef: "NSGRP — Annex B",
      whyItMatters: "Risk factors in the partner, combined with sensitive research, are what the reviewers will look at hardest. Naming them and mitigating them is far better than leaving them for the reviewers to find.",
      crossLink: { tool: "risk-checklist", label: "Open Risk Checklist" },
      yes: "develop-mitigation",
      no: "document-no-risk"
    },
    {
      id: "document-no-risk",
      type: "action",
      label: "Record why no significant risk was identified",
      description: "Write down what you checked — the Annex A areas you considered, the due diligence on the partner, and the sources you used. That record is what you draw on for the form, and what your institution can stand behind later.",
      policyRef: "NSGRP — Identify potential risks",
      next: "submit-raf"
    },
    {
      id: "develop-mitigation",
      type: "action",
      label: "Develop a risk mitigation plan",
      description: "Address each identified risk: team composition and training, cybersecurity and data management, controls on access to results, clear agreements on intellectual property and intended use, and how the partnership will be monitored. The Risk Mitigation Guide in this toolkit lists concrete measures.",
      policyRef: "NSGRP — Mitigation measures",
      crossLink: { tool: "risk-mitigation", label: "Open Risk Mitigation Guide" },
      next: "submit-raf"
    },
    {
      id: "submit-raf",
      type: "action",
      label: "Submit the Risk Assessment Form with the application",
      description: "Complete the form, including any mitigation measures, and submit it as part of the grant application. The funding organization reviews every form, consulting national security departments and agencies where appropriate. If the research is in a Sensitive Technology Research Area, the STRAC Policy's named-researcher attestation applies separately.",
      policyRef: "NSGRP — Implementation",
      resourceLink: { url: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form", label: "Open the Risk Assessment Form" },
      crossLink: { tool: "strac-flowchart", label: "Check the STRAC Policy" },
      next: "agency-review"
    },
    {
      id: "agency-review",
      type: "decision",
      label: "Does the funding organization accept the risk?",
      description: "The funding organization decides, in consultation with national security partners where needed. It may fund the project as proposed, fund it on condition of additional mitigation, or decline it where risks cannot be mitigated. The institution does not make this determination.",
      policyRef: "NSGRP — Implementation",
      yes: "end-proceed",
      no: "end-declined"
    },
    {
      id: "end-proceed",
      type: "end",
      label: "Partnership funded",
      description: "The funding organization has accepted the partnership, possibly with conditions. Keep monitoring the partner and the risk factors for the life of the project, and re-check the NRO list before any renewal or new application."
    },
    {
      id: "end-declined",
      type: "end",
      label: "Application not funded",
      description: "The funding organization assessed the partnership as posing national security risks that could not be mitigated. Restructuring the partnership or choosing a different partner may make a future application viable."
    }
  ]
};
