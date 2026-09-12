import { useRef } from 'react';

/**
 * Shared tab pattern for the tabbed tool pages (WCAG 4.1.2).
 *
 * Plain <button>s gave a screen reader no way to tell which tab was current —
 * the active state lived only in a CSS class. These expose role/aria-selected
 * and wire each tab to its panel.
 *
 * Each tool keeps its own CSS prefix (`trag-`, `csec-`, `csec-os`, `dual-`), so
 * `prefix` drives both the class names (`${prefix}-tab`, `${prefix}-tab--active`)
 * and the tab↔panel id wiring.
 *
 * Roving tabindex: only the selected tab sits in the tab order, so the group is
 * a single tab stop. Arrow keys / Home / End move between tabs — required,
 * since tabIndex={-1} is what takes the others out of the Tab sequence. The key
 * handler lives on each tab rather than the tablist: the tabs are the focusable
 * elements, so that is where the keystrokes actually land.
 */
export function TabList({ tabs, activeId, onChange, prefix, label, extraClass = '' }) {
  const listRef = useRef(null);

  function onKeyDown(e) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    const current = tabs.findIndex(t => t.id === activeId);
    let next = null;

    if (step !== undefined) next = (current + step + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;

    e.preventDefault();
    onChange(tabs[next].id);
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
  }

  return (
    <div
      className={`${prefix}-tabs${extraClass ? ` ${extraClass}` : ''}`}
      role="tablist"
      aria-label={label}
      ref={listRef}
    >
      {tabs.map(tab => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            id={`${prefix}-tab-${tab.id}`}
            role="tab"
            aria-selected={active}
            // Panels are mounted only while selected, so only the selected tab
            // advertises one — aria-controls must not dangle on a missing id.
            aria-controls={active ? `${prefix}-panel-${tab.id}` : undefined}
            tabIndex={active ? 0 : -1}
            className={`${prefix}-tab${active ? ` ${prefix}-tab--active` : ''}`}
            onClick={() => onChange(tab.id)}
            onKeyDown={onKeyDown}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, prefix, className, children }) {
  return (
    <div
      role="tabpanel"
      id={`${prefix}-panel-${id}`}
      aria-labelledby={`${prefix}-tab-${id}`}
      className={className ?? `${prefix}-tab-content`}
    >
      {children}
    </div>
  );
}
