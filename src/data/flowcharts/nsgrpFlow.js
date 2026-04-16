export const nsgrpFlow = {
  id: "nsgrp",
  title: "NSGRP Research Partnership Decision Flow",
  lastUpdated: "2025-01-24",
  policySource: "National Security Guidelines for Research Partnerships",
  sourceUrl: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/national-security-guidelines-research-partnerships",
  nodes: [
    {
      id: "start",
      type: "start",
      label: "New Research Partnership Opportunity",
      description: "You are considering a research partnership involving external collaborators, funders, or organizations.",
      next: "check-federal-funding"
    },
    {
      id: "check-federal-funding",
      type: "decision",
      label: "Is the partnership federally funded?",
      description: "Determine whether the research partnership will involve funding from a federal granting council (NSERC, SSHRC, CIHR) or CFI. The NSGRP applies to relevant federal research partnership funding opportunities.",
      policyRef: "NSGRP, Implementation",
      whyItMatters: "Federally funded research partnerships are subject to mandatory NSGRP requirements. Non-federal partnerships are encouraged but not required to follow the guidelines.",
      yes: "check-sensitive-area",
      no: "recommend-voluntary"
    },
    {
      id: "recommend-voluntary",
      type: "end",
      label: "Voluntary assessment recommended",
      description: "NSGRP compliance is not mandatory for non-federally funded partnerships. However, all researchers are encouraged to assess partnerships using the NSGRP framework — review Annex A (sensitive research areas) and Annex B (partner risk factors), document your findings, and manage risks through your institution. No RAF submission to a federal agency is required.",
      policyRef: "NSGRP, Summary"
    },
    {
      id: "check-sensitive-area",
      type: "decision",
      label: "Does research involve sensitive areas (Annex A)?",
      description: "Review whether your research falls within sensitive areas including: export-controlled fields, dual-use technologies, critical minerals, critical infrastructure sectors, large datasets, or sensitive personal data.",
      policyRef: "NSGRP, Annex A",
      whyItMatters: "Both Annex A (sensitive research) AND Annex B (partner risk factors) must be present to trigger the mandatory RAF submission requirement. If Annex A does not apply, no further compliance steps are required.",
      crossLink: { tool: "stra-lookup", label: "Open STRA Lookup" },
      yes: "check-partner-risk",
      no: "end-no-sensitive"
    },
    {
      id: "end-no-sensitive",
      type: "end",
      label: "Document due diligence and proceed",
      description: "Your research does not involve sensitive areas under Annex A. The mandatory RAF requirement does not apply. Document your due diligence assessment and proceed with the standard grant application process."
    },
    {
      id: "check-partner-risk",
      type: "decision",
      label: "Does the partner pose risk factors (Annex B)?",
      description: "Assess whether your partner organization is state-owned, subject to state influence, lacks institutional autonomy, or operates under laws compelling knowledge transfer to foreign governments. Consider whether partner personnel have ties to foreign militaries or governments.",
      policyRef: "NSGRP, Annex B",
      whyItMatters: "Both Annex A and Annex B triggers must be present for mandatory RAF submission. Annex B alone — without sensitive research — does not trigger the requirement.",
      crossLink: { tool: "risk-checklist", label: "Open Risk Checklist" },
      yes: "develop-mitigation",
      no: "low-risk-path"
    },
    {
      id: "low-risk-path",
      type: "action",
      label: "Document due diligence findings",
      description: "No elevated partner risk factors identified. Document your assessment using the NSGRP framework, then proceed to complete the attestation and submit your grant application with the RAF.",
      policyRef: "NSGRP, Identify potential risks",
      next: "attest"
    },
    {
      id: "develop-mitigation",
      type: "action",
      label: "Develop risk mitigation plan",
      description: "Create a plan addressing identified risks. Consider: building a strong research team, assessing partner motivations, using sound cybersecurity and data management practices, and agreeing on intended use of research findings.",
      policyRef: "NSGRP, Mitigation measures",
      next: "attest"
    },
    {
      id: "attest",
      type: "action",
      label: "All named researchers complete the attestation",
      description: "All researchers with a named role on the grant must sign an attestation form confirming compliance with research security requirements. This is required as part of the federal grant application.",
      policyRef: "NSGRP, Implementation",
      next: "submit-raf"
    },
    {
      id: "submit-raf",
      type: "action",
      label: "Submit Risk Assessment Form with application",
      description: "Complete and submit the Risk Assessment Form along with your proposed risk mitigation measures as part of the grant application. The form will be reviewed by the funding agency in consultation with national security partners as appropriate.",
      policyRef: "NSGRP, Implementation",
      next: "agency-review"
    },
    {
      id: "agency-review",
      type: "decision",
      label: "Funding agency determines risk is acceptable?",
      description: "The funding agency (NSERC, SSHRC, or CIHR), in consultation with national security partners, assesses the application. Even a well-mitigated RAF is subject to agency adjudication — the institution does not make the final determination. High-risk partnerships where risks cannot be appropriately mitigated will not be funded.",
      policyRef: "NSGRP, Implementation",
      yes: "end-proceed",
      no: "end-declined"
    },
    {
      id: "end-proceed",
      type: "end",
      label: "Partnership funded and approved",
      description: "The funding agency has assessed the partnership as acceptable. Continue to monitor and manage risks throughout the lifecycle of the project."
    },
    {
      id: "end-declined",
      type: "end",
      label: "Application not funded",
      description: "The funding agency assessed the partnership as posing unacceptable national security risks that could not be appropriately mitigated. Consider restructuring the partnership or seeking alternative collaborators."
    }
  ]
};
