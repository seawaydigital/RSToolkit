import { releaseStatus } from './releaseStatus';
const categoryDefinitions = [
  {
    id: 'policy-guides',
    label: 'Policy Guides',
    emoji: '\uD83D\uDCDC',
    primary: true,
    description: 'Interactive flowcharts explaining key research security policies',
    tools: [
      {
        id: 'tri-agency-guide',
        name: 'Tri-Agency Research Security Guide',
        slug: 'tri-agency-guide',
        description: 'Source-backed introduction to the separate NSGRP and STRAC requirements',
        tags: ['tri-agency', 'nserc', 'cihr', 'sshrc', 'policy', 'guide', 'principles'],
        related: ['strac-flowchart', 'nsgrp-flowchart', 'stra-lookup'],
      },
      {
        id: 'strac-flowchart',
        name: 'STRAC Policy Flowchart',
        slug: 'strac-flowchart',
        description: 'Interactive decision flow for the Policy on Sensitive Technology Research and Affiliations of Concern',
        tags: ['strac', 'policy', 'flowchart', 'compliance'],
        related: ['stra-lookup', 'nro-lookup'],
      },
      {
        id: 'nsgrp-flowchart',
        name: 'NSGRP Flowchart',
        slug: 'nsgrp-flowchart',
        description: 'National Security Guidelines for Research Partnerships decision flow',
        tags: ['nsgrp', 'policy', 'flowchart', 'partnerships'],
        related: ['risk-checklist', 'stra-lookup'],
      },
      {
        id: 'ontario-flowchart',
        name: 'Ontario RS Guidelines',
        slug: 'ontario-flowchart',
        description: 'Ontario Research Security Guidelines decision flow',
        tags: ['ontario', 'policy', 'flowchart', 'provincial'],
        related: ['nro-lookup', 'export-control'],
      },
    ],
  },
  {
    id: 'compliance-tools',
    label: 'Preparation Tools',
    emoji: '\u2705',
    primary: true,
    description: 'Explore technology categories, organization names, and preparation topics',
    tools: [
      {
        id: 'stra-lookup',
        name: 'STRA Category Explorer',
        slug: 'stra-lookup',
        description: 'Browse official technology categories with keyword aids and your own recorded assessment',
        tags: ['stra', 'technology', 'search', 'assessment', 'technologies sensibles'],
        related: ['strac-flowchart', 'nro-lookup'],
      },
      {
        id: 'nro-lookup',
        name: 'NRO Name Lookup',
        slug: 'nro-lookup',
        description: 'Search the local official-name and alias snapshot; a result does not establish a relationship',
        tags: ['nro', 'organizations', 'search', 'organisations de recherche nommées', 'ORN'],
        related: ['strac-flowchart', 'stra-lookup'],
      },
      {
        id: 'risk-checklist',
        name: 'Research Security Preparation Worksheet',
        slug: 'risk-checklist',
        description: 'Temporary worksheet that separates answered topics from unresolved concerns',
        tags: ['risk', 'checklist', 'assessment', 'grant'],
        related: ['nsgrp-flowchart', 'export-control'],
      },
      {
        id: 'risk-mitigation',
        name: 'Risk Mitigation Guide',
        slug: 'risk-mitigation',
        description: 'Proportionate measures for people, partnerships, research data and ongoing review',
        tags: ['risk', 'mitigation', 'best practices', 'partners', 'security'],
        related: ['risk-checklist', 'nsgrp-flowchart', 'nro-lookup'],
      },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    emoji: '\uD83D\uDCD6',
    primary: true,
    description: 'Quick reference guides for export controls and regulations',
    tools: [
      {
        id: 'export-control',
        name: 'Export Control Quick Reference',
        slug: 'export-control',
        description: 'Searchable reference for EIPA, Controlled Goods List, sanctions, and regulations',
        tags: ['export', 'control', 'eipa', 'sanctions', 'reference'],
        related: ['risk-checklist', 'nsgrp-flowchart'],
      },
      {
        id: 'glossary',
        name: 'Glossary / Jargon Decoder',
        slug: 'glossary',
        description: 'Definitions of key research security terms from Canadian and Ontario Government sources',
        tags: ['glossary', 'definitions', 'jargon', 'terms', 'reference'],
        related: ['faq', 'strac-flowchart'],
      },
      {
        id: 'faq',
        name: 'Research Security FAQ',
        slug: 'faq',
        description: 'Answers to common questions about STRAC, NRO, NSGRP, export controls, and compliance',
        tags: ['faq', 'questions', 'compliance', 'guidance'],
        related: ['glossary', 'stra-lookup', 'nro-lookup'],
      },
    ],
  },
  {
    id: 'operational-security',
    label: 'Operational Security',
    emoji: '🔒',
    primary: true,
    description: 'Day-to-day security practices for protecting research data, devices, and accounts',
    tools: [
      {
        id: 'cybersecurity-guide',
        name: 'Cybersecurity Best Practices',
        slug: 'cybersecurity-guide',
        description: 'Source-backed practices for accounts, devices, approved services and recovery',
        tags: ['cybersecurity', 'security', 'encryption', 'passwords', '2fa', 'backup', 'ai', 'devices'],
        related: ['risk-mitigation', 'stra-lookup'],
      },
    ],
  },
];

export const CATEGORIES = categoryDefinitions.map(c => ({ ...c, tools: c.tools.filter(t => !releaseStatus.disabledTools.includes(t.id)) })).filter(c => c.tools.length);
export const PRIMARY_CATEGORIES = CATEGORIES.filter(c => c.primary);
export const MORE_CATEGORIES = CATEGORIES.filter(c => !c.primary);

export const ALL_TOOLS = CATEGORIES.flatMap(cat =>
  cat.tools.map(tool => ({
    ...tool,
    categoryId: cat.id,
    categoryLabel: cat.label,
    categoryEmoji: cat.emoji,
  }))
);

export function getToolById(id) {
  return ALL_TOOLS.find(t => t.id === id) || null;
}
