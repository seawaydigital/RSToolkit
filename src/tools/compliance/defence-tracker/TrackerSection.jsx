import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// An expandable section. The body stays in the page (hidden while closed), so
// printing can show every section and aria-controls always points at it.
export default function TrackerSection({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  return (
    <section className="dit-section">
      <h2 className="dit-section-heading">
        <button type="button" className="dit-section-toggle" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((o) => !o)}>
          <span>{title}</span>
          {count !== undefined && <span className="dit-section-count">{count}</span>}
          <ChevronDown className={`dit-section-chevron${open ? ' dit-section-chevron--open' : ''}`} size={16} aria-hidden="true" />
        </button>
      </h2>
      <div id={bodyId} className="dit-section-body" hidden={!open}>
        {children}
      </div>
    </section>
  );
}
