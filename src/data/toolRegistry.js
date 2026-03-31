export const CATEGORIES = [
  {
    id: 'policy-guides',
    label: 'Policy Guides',
    emoji: '\uD83D\uDCDC',
    primary: true,
    description: 'Interactive flowcharts explaining key research security policies',
    tools: [
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
    label: 'Compliance Tools',
    emoji: '\u2705',
    primary: true,
    description: 'Tools to check STRA, NRO affiliations, and assess risks',
    tools: [
      {
        id: 'stra-lookup',
        name: 'STRA Lookup',
        slug: 'stra-lookup',
        description: 'Search and browse Sensitive Technology Research Areas with guided assessment',
        tags: ['stra', 'technology', 'search', 'assessment', 'wizard'],
        related: ['strac-flowchart', 'nro-lookup'],
      },
      {
        id: 'nro-lookup',
        name: 'NRO Lookup & Map',
        slug: 'nro-lookup',
        description: 'Search Named Research Organizations with interactive map visualization',
        tags: ['nro', 'organizations', 'map', 'search'],
        related: ['strac-flowchart', 'stra-lookup'],
      },
      {
        id: 'risk-checklist',
        name: 'Risk Assessment Checklist',
        slug: 'risk-checklist',
        description: 'Interactive grant application risk assessment walkthrough',
        tags: ['risk', 'checklist', 'assessment', 'grant'],
        related: ['nsgrp-flowchart', 'export-control'],
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
    ],
  },
];

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
