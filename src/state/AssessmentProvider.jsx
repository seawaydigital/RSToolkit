import { useState } from 'react';
import { AssessmentContext } from './assessmentContext';
import { newAssessment, STORAGE_KEY, LEGACY_KEY, validateAssessment } from '../lib/assessment';
import { riskChecklist } from '../data/riskChecklist';

const allowedIds = riskChecklist.sections.flatMap(s => s.items.map(i => i.id));

export default function AssessmentProvider({ children }) {
  const [state, setState] = useState(newAssessment);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState('Temporary worksheet. Reloading or closing this page clears current work.');
  const [undo, setUndo] = useState(null);
  const [saved, setSaved] = useState(() => {
    try { return Boolean(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY)); } catch { return false; }
  });
  function persist(next) {
    try {
      const minimal = validateAssessment(next, allowedIds);
      if (!minimal) throw new Error('Invalid worksheet');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
      setSaved(true);
      setStatus('Worksheet saved on this device. Guided paths and STRA exploration remain temporary.');
    } catch { setStatus('Saving failed. Current work is available in this page only.'); }
  }
  function update(change) {
    const next = typeof change === 'function' ? change(state) : { ...state, ...change };
    setState(next);
    if (remember) persist(next);
  }
  function enableRemember(enabled) {
    if (enabled) { setRemember(true); persist(state); }
    else { clearSaved(); }
  }
  function clearSaved() {
    setRemember(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_KEY);
      setSaved(false);
      setStatus('Saved copies cleared. Current worksheet remains temporary in this page.');
    } catch { setStatus('Could not clear browser storage. Use your browser’s site-data controls; a saved copy may remain.'); }
  }
  function startNew() {
    setUndo(state);
    setState({ ...newAssessment(), institution: state.institution });
    setRemember(false);
    setStatus(saved ? 'New blank worksheet. An earlier saved worksheet remains on this device; Resume restores it.' : 'New blank temporary worksheet.');
  }
  function undoReset() {
    if (!undo) return;
    setState(undo); setUndo(null); setRemember(false);
    setStatus('Previous worksheet restored in memory. Device saving is off.');
  }
  function resume() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw && localStorage.getItem(LEGACY_KEY)) {
        setStatus('An older checklist exists. Its question meanings and version are unverified, so its answers cannot be resumed. Start a new worksheet and use Clear saved data when ready to remove the old copy.');
        return;
      }
      const restored = raw ? validateAssessment(JSON.parse(raw), allowedIds) : null;
      if (!restored) { setStatus('The saved worksheet is invalid or uses different content. It has not been merged. Start a new worksheet or clear saved data.'); return; }
      setUndo(state); setState(restored); setRemember(false);
      setStatus('Saved worksheet explicitly resumed. Review its answers. Device saving is off until you enable it.');
    } catch { setStatus('The saved worksheet could not be read. Current work has not changed.'); }
  }
  return <AssessmentContext.Provider value={{ state, update, remember, enableRemember, saved, status, startNew, clearSaved, resume, canUndo: Boolean(undo), undoReset }}>{children}</AssessmentContext.Provider>;
}
