export const stracFlow = {
  id: "strac",
  title: "STRAC Policy Decision Flow",
  lastUpdated: "2025-01-24",
  policySource: "Policy on Sensitive Technology Research and Affiliations of Concern",
  sourceUrl: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/policy-sensitive-technology-research-and-affiliations-concern",
  nodes: [
    { id: "start", type: "start", label: "New Grant Application", description: "You are applying for funding from NSERC, SSHRC, CIHR, or CFI.", next: "check-stra" },
    { id: "check-stra", type: "decision", label: "Does research advance a STRA?", description: "Review the Sensitive Technology Research Areas list to determine if your research advances any listed area.", policyRef: "STRAC Policy, Section 3", whyItMatters: "If your research advances a STRA, additional compliance steps apply to all researchers on the grant.", yes: "check-nro", no: "no-action" },
    { id: "no-action", type: "end", label: "No further action required", description: "Your research does not advance a STRA. Standard grant application process applies." },
    { id: "check-nro", type: "action", label: "Check all researcher affiliations against NRO list", description: "Every researcher (applicants, co-applicants, collaborators) must be checked against the Named Research Organizations list.", policyRef: "STRAC Policy, Section 4", crossLink: { tool: "nro-lookup", label: "Open NRO Lookup" }, next: "nro-result" },
    { id: "nro-result", type: "decision", label: "Any researcher affiliated with an NRO?", description: "An affiliation means employed by, appointed at, or conducting research at a listed organization.", yes: "resolve-nro", no: "attest" },
    { id: "resolve-nro", type: "action", label: "Researcher must sever NRO connection OR leave the project", description: "The affiliated researcher must either terminate their connection with the NRO or be removed from the grant application.", policyRef: "STRAC Policy, Section 4.2", next: "attest" },
    { id: "attest", type: "action", label: "Complete attestation form", description: "All researchers must attest that they comply with the policy. Ongoing compliance is required for the duration of the grant.", policyRef: "STRAC Policy, Section 5", next: "end" },
    { id: "end", type: "end", label: "Grant application proceeds", description: "All compliance steps are complete. Submit your application." }
  ]
};
