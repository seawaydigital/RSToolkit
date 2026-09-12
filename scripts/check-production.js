// Read-only actual-host check. Run after an authorized release; no authentication is needed.
import { securityHeaders } from './security-headers.js';
const origin = process.argv[2];
if (!origin || new URL(origin).protocol !== 'https:') throw new Error('Provide the exact HTTPS origin');
const response = await fetch(origin, { redirect: 'manual' });
const failures = [];
if (response.status !== 200) failures.push('HTTPS response is not 200');
for (const [key, expected] of Object.entries(securityHeaders)) {
 const actual = response.headers.get(key);
 if (key === 'Content-Security-Policy') {
  const actualDirectives = (actual || '').split(';').map(s => s.trim().split(/\s+/));
  for (const directive of expected.split(';').map(s => s.trim().split(/\s+/))) {
   const matches = actualDirectives.filter(d => d[0] === directive[0]);
   if (matches.length !== 1 || matches[0].slice(1).sort().join(' ') !== directive.slice(1).sort().join(' ')) failures.push(key + ' differs for ' + directive[0]);
  }
 } else if (actual !== expected) failures.push(key + ': expected ' + expected + ', received ' + actual);
}
if (!/max-age=[1-9]/.test(response.headers.get('strict-transport-security') || '')) failures.push('HSTS absent');
const http = await fetch(origin.replace('https:', 'http:'), { redirect: 'manual' });
if (![301, 302, 307, 308].includes(http.status) || !http.headers.get('location')?.startsWith(origin)) failures.push('HTTP does not redirect to this HTTPS origin');
console.log(JSON.stringify({ origin, checkedAt: new Date().toISOString(), failures }, null, 2));
if (failures.length) process.exitCode = 1;
