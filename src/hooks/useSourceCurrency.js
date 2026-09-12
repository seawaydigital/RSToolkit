import { useEffect, useState } from 'react';
import { sourcesCurrent } from '../data/policySources';
export function useSourceCurrency(ids, extraDeadline) {
 const [now, setNow] = useState(() => new Date());
 useEffect(() => {
  const refresh = () => setNow(new Date());
  const timer = window.setInterval(refresh, 60000);
  document.addEventListener('visibilitychange', refresh);
  return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
 }, []);
 return sourcesCurrent(ids, now) && (!extraDeadline || now <= new Date(extraDeadline + 'T23:59:59Z'));
}
