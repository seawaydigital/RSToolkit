/**
 * Dual-Use Research self-assessment question tree.
 * Same node shape as straWizard.js, but deliberately CONCEPTUAL: it probes
 * intent/use, knowledge transfer, and partner exposure — and hands off to
 * STRA Lookup / NRO Lookup / Export Control rather than enumerating STRA
 * categories itself.
 *
 * Question nodes: { text, type: "yesno"|"choice", yes/no | options[] }
 * Result nodes:   { type:"result", signal:"likely"|"possible"|"low", title,
 *                   description, flags:[...], nextSteps:[{label, tool?|url?}] }
 */

export const dualUseWizard = {
  startQuestion: "q1",
  questions: {
    q1: {
      text: "Could the knowledge, data, or technology your research produces meaningfully advance a military, defence, intelligence, security, or weapons capability — even if that is not your intent?",
      type: "yesno",
      yes: "q-partner",
      no: "q1b",
    },
    q1b: {
      text: "Could your research outputs be used to surveil, target, manipulate, or identify vulnerabilities in a population or group — including through health, behavioural, or social-science data?",
      type: "yesno",
      yes: "q-partner",
      no: "q-stra",
    },
    "q-partner": {
      text: "Will the research involve international collaborators, foreign funding, or any team member affiliated with — or funded by — an organization on Canada's Named Research Organizations / entities-of-concern list?",
      type: "yesno",
      yes: "result-likely-partner",
      no: "result-likely-solo",
    },
    "q-stra": {
      text: "Even so, does your research develop or advance an emerging technology — for example AI, quantum, advanced materials, biotechnology, advanced sensing, robotics, or aerospace?",
      type: "yesno",
      yes: "result-possible",
      no: "result-low",
    },

    // ── RESULT NODES ──
    "result-likely-partner": {
      type: "result",
      signal: "likely",
      title: "Likely dual-use, with partner exposure",
      description:
        "Your research could advance a military, intelligence, or population-targeting capability, and your team or funding has potential affiliation exposure. Run the full due-diligence chain before applying for funding or signing agreements.",
      flags: [
        "Potential military / intelligence / population-targeting application",
        "International collaborators, foreign funding, or possible NRO / entity-of-concern affiliation",
      ],
      nextSteps: [
        { label: "Screen your team against the NRO list", tool: "nro-lookup" },
        { label: "Check your area against the STRA list", tool: "stra-lookup" },
        { label: "Check export controls & sanctions", tool: "export-control" },
        { label: "Walk the STRAC policy flow", tool: "strac-flowchart" },
        { label: "Run the grant risk checklist", tool: "risk-checklist" },
      ],
    },
    "result-likely-solo": {
      type: "result",
      signal: "likely",
      title: "Likely dual-use",
      description:
        "Your research could advance a military, intelligence, or population-targeting capability. No collaborator or funding exposure is flagged right now, but re-run this assessment if your team or partners change.",
      flags: [
        "Potential military / intelligence / population-targeting application",
        "No current collaborator or funding exposure identified",
      ],
      nextSteps: [
        { label: "Check your area against the STRA list", tool: "stra-lookup" },
        { label: "Check export controls & sanctions", tool: "export-control" },
        { label: "Run the grant risk checklist", tool: "risk-checklist" },
      ],
    },
    "result-possible": {
      type: "result",
      signal: "possible",
      title: "Possible dual-use — verify",
      description:
        "No obvious military, intelligence, or targeting application surfaced, but your work advances an emerging technology that may still fall under a Sensitive Technology Research Area or export controls. Verify against the authoritative lists.",
      flags: [
        "Emerging-technology research",
        "No obvious military / intelligence use identified in this assessment",
      ],
      nextSteps: [
        { label: "Check your area against the STRA list", tool: "stra-lookup" },
        { label: "Browse the Dual-Use Areas examples", tool: null },
      ],
    },
    "result-low": {
      type: "result",
      signal: "low",
      title: "Low dual-use signal",
      description:
        "Based on your answers, no clear dual-use indicators surfaced. Dual-use concerns are context-dependent and can change — review the Dual-Use Areas examples and consult your Research Security office if anything is uncertain.",
      flags: ["No dual-use indicators identified in this assessment"],
      nextSteps: [
        { label: "Browse the Dual-Use Areas examples", tool: null },
      ],
    },
  },
};
