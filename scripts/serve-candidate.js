// Loopback-only production-build verification server, not an internet deployment server.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { securityHeaders } from './security-headers.js';
const root = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };
createServer(async (req, res) => {
 try {
  const route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const path = resolve(root, '.' + (route === '/' ? '/index.html' : route));
  if (!path.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  const body = await readFile(path);
  res.writeHead(200, { ...securityHeaders, 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
 } catch { res.writeHead(404, securityHeaders); res.end('Not found'); }
}).listen(4187, '127.0.0.1', () => console.log('Candidate available at http://127.0.0.1:4187'));
