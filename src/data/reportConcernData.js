export const reportConcernData = {
  id: 'report-concern',
  lastUpdated: '2026-09-02',
  sourceUrl:
    'https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cntr-trrrsm/cntr-prlfrtn/sfgrdng-scnc/index-en.aspx',
  sourceLabel: 'Public Safety Canada — Safeguarding Science',

  intro:
    'If something feels wrong, reporting it early is almost always the right call. You do not need to be certain, and you are not expected to investigate it yourself.',

  // The single most important message on the page: institution first, not Ottawa.
  firstStep: {
    title: 'Start with your own institution',
    body:
      'For nearly every situation below, your first call is your institution’s research security office, or your Vice-President Research. They can escalate to federal partners on your behalf, and they know what your grants and agreements already commit you to. Going straight to a federal body is rarely wrong, but it is rarely faster either.',
    exception:
      'The exception is immediate danger or a crime in progress — call 911, or local emergency services if you are abroad.',
  },

  scenarios: [
    {
      id: 'device',
      title: 'A device was lost, stolen, seized, or left my sight',
      now: [
        'Tell your IT or information security team immediately — not when you get back.',
        'Ask them to revoke credentials and remote-wipe if the device supported it.',
        'Change passwords for anything that device could reach, from a different device.',
      ],
      then:
        'Treat the device as compromised even if you get it back. Have IT re-image it rather than reconnecting it to your accounts.',
      contacts: ['institution-it', 'institution-rso'],
      crossLink: { tool: 'travel-security', label: 'Travel security checklist' },
    },
    {
      id: 'approach',
      title: 'Someone approached me about my research in a way that felt off',
      now: [
        'Write down what happened while it is fresh — who, when, where, what was asked for.',
        'Do not confront the person or try to test them.',
        'Report it to your research security office.',
      ],
      then:
        'A single approach may mean nothing. Patterns only become visible once individual reports accumulate, which is exactly why reporting a small thing is useful.',
      contacts: ['institution-rso', 'psc-rsc', 'csis'],
      crossLink: { tool: 'dual-use', label: 'Red flags when vetting collaborators' },
    },
    {
      id: 'coercion',
      title: 'I am being pressured, threatened, or leveraged — including through family abroad',
      now: [
        'If anyone is in immediate danger, call 911.',
        'Contact your research security office, and CSIS or the RCMP.',
        'Keep any messages or records; do not delete them.',
      ],
      then:
        'Pressure directed at researchers through relatives abroad is a recognised form of foreign interference. It is taken seriously and you are not in trouble for reporting it.',
      contacts: ['emergency', 'csis', 'rcmp-nsin', 'institution-rso'],
      link: {
        url: 'https://www.publicsafety.gc.ca/cnt/ntnl-scrt/frgn-ntrfrnc/prtct-gnst-frgn-ntrfrnc-en.aspx',
        label: 'Protect yourself against foreign interference',
      },
    },
    {
      id: 'cyber',
      title: 'Phishing, account compromise, ransomware, or a suspected intrusion',
      now: [
        'Report to your institution’s IT security team first — they can contain it.',
        'Do not pay a ransom or reply to the sender.',
        'Preserve the evidence: keep the email, take screenshots, note timestamps.',
      ],
      then:
        'Your institution reports onward to the Canadian Centre for Cyber Security where appropriate. You can also report directly.',
      contacts: ['institution-it', 'cyber-centre'],
      crossLink: { tool: 'cybersecurity-guide', label: 'Cybersecurity best practices' },
    },
    {
      id: 'affiliation',
      title: 'I found an undisclosed affiliation — mine, a collaborator’s, or a trainee’s',
      now: [
        'Do not assume bad intent. Undisclosed affiliations are often administrative oversights.',
        'Raise it with your research security office or research services.',
        'Check whether it changes eligibility or attestation obligations on an active grant.',
      ],
      then:
        'Correcting the record early is much better than having it surface during a funding review.',
      contacts: ['institution-rso', 'funding-agency'],
      crossLink: { tool: 'strac-flowchart', label: 'Does STRAC apply?' },
    },
    {
      id: 'data',
      title: 'Research data, IP, or unpublished results may have been taken',
      now: [
        'Report to your research security office and IT security the same day.',
        'Do not alter or delete files — preserve logs and access records.',
        'Note who had access and when you last knew the data to be intact.',
      ],
      then:
        'Your institution decides on notification to funders, partners, and law enforcement. Depending on the technology involved, export control or the Controlled Goods Program may also be engaged.',
      contacts: ['institution-rso', 'institution-it', 'rcmp-nsin'],
      crossLink: { tool: 'export-control', label: 'Export control quick reference' },
    },
    {
      id: 'unsure',
      title: 'I am not sure it is anything, but something feels wrong',
      now: [
        'Report it anyway. You are not expected to be certain, and you will not be penalised for a report that turns out to be nothing.',
        'Describe what you observed rather than what you concluded.',
      ],
      then:
        'Research security offices would far rather field ten reports that go nowhere than miss the one that mattered.',
      contacts: ['institution-rso', 'psc-rsc'],
    },
  ],

  contacts: {
    emergency: {
      label: 'Emergency services',
      detail: 'Immediate danger, or a crime in progress. Abroad, use local emergency services.',
      phone: '911',
      urgent: true,
    },
    'institution-rso': {
      label: 'Your institution’s Research Security Office',
      detail:
        'First call for almost everything on this page. Often sits under the VP Research. If you do not know who this is, ask your research services or grants office.',
      local: true,
    },
    'institution-it': {
      label: 'Your institution’s IT / information security team',
      detail: 'Device loss, account compromise, phishing, and anything needing containment.',
      local: true,
    },
    'funding-agency': {
      label: 'Your funding agency (NSERC, CIHR, SSHRC)',
      detail:
        'Usually contacted through your institution rather than directly, since attestations and agreements run through them.',
      url: 'https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/tri-agency-guidance-research-security',
    },
    'psc-rsc': {
      label: 'Public Safety Canada — Research Security Centre',
      detail: 'Federal first point of contact for research security advice and concerns.',
      email: 'researchsecurity-securiteenrecherche@ps-sp.gc.ca',
      url: 'https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cntr-trrrsm/cntr-prlfrtn/sfgrdng-scnc/index-en.aspx',
    },
    'cyber-centre': {
      label: 'Canadian Centre for Cyber Security',
      detail: 'Cyber incidents. Part of the Communications Security Establishment.',
      url: 'https://www.cyber.gc.ca/en/incident-management',
    },
    csis: {
      label: 'CSIS',
      detail: 'Non-urgent national security concerns, including foreign interference.',
      phone: '1-800-267-7685',
      url: 'https://www.canada.ca/en/security-intelligence-service/corporate/contact-us.html',
    },
    'rcmp-nsin': {
      label: 'RCMP — National Security Information Network',
      detail: 'Suspicious incidents and activity with a possible national security dimension.',
      phone: '1-800-420-5805',
      email: 'NSIN_RISN@rcmp-grc.gc.ca',
      url: 'https://www.rcmp-grc.gc.ca/en/national-security',
    },
  },

  protections: {
    title: 'Before you hesitate',
    points: [
      'Reporting a concern is not an accusation, and it does not start a disciplinary process against anyone.',
      'You are not expected to have proof, or to have investigated anything yourself.',
      'Reports that turn out to be nothing are a normal and expected part of how this works.',
      'If you are worried about how a report affects you or your funding, say so when you report it — that is a fair question to ask up front.',
    ],
  },
};
