import { useEffect } from 'react';

// Filled in by Task 10 of the implementation plan.
export default function InstitutionProfile({ record, onPageTitle }) {
  useEffect(() => {
    onPageTitle?.(record.name);
  }, [record.name, onPageTitle]);
  return (
    <div className="tool-page">
      <h1 className="dit-title">{record.name}</h1>
      <a className="dit-button" href="#defence-tracker">Back to search</a>
    </div>
  );
}
