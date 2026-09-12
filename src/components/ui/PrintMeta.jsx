import { CONTENT_VERSION } from '../../data/policySources';
export default function PrintMeta({ assessment }) {
  return <div className="print-only print-meta">
    <p>Generated {new Date().toLocaleString('en-CA')} · Content {CONTENT_VERSION}</p>
    {assessment && <p>Worksheet {assessment.id} · Created {assessment.createdAt} · Context: {assessment.institution === 'lakehead' ? 'Lakehead' : 'Other institution'}</p>}
    <p>Working aid. Unresolved matters remain unresolved. This document is not the official RAF, legal clearance or institutional approval.</p>
  </div>;
}
