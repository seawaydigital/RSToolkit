# Handoff Guide

Everything needed to build, host, configure, and maintain the Research Security Toolkit.

**Last updated: 2026-10-03**

---

## 1. What this is

A static website. React + Vite compile to a folder of HTML, CSS, JS, and images.

- **No backend.** No server-side code, no database, no API, no environment secrets.
- **No accounts, no login, no analytics, no tracking.** The only data stored about a user is their own checklist progress, in their own browser's `localStorage`.
- **All content is compiled in at build time.** Updating policy content means editing a file in `src/data/` and redeploying.

---

## 2. Build and deploy

```bash
npm ci          # install exactly the locked dependency versions
npm run build   # → dist/
```

Serve the contents of `dist/` from any static host: Apache, nginx, IIS, S3, GitHub Pages, or a university web server. Node is needed to *build*, not to *serve*.

**No URL rewrite rules are required.** Routing is hash-based (`/#nro-lookup`), so the browser only ever requests `/`. The usual SPA "every route must fall back to index.html" configuration does not apply here.

### Hosting under a subdirectory

To serve from e.g. `https://lakeheadu.ca/research-security/`:

```bash
BASE_PATH=/research-security/ npm run build
```

Both slashes matter. This rewrites every asset URL in the output; it has been verified working.

### Build requirements

Node 20 or newer — `package.json`'s `engines` field states that floor. The GitHub Actions workflow and `.nvmrc` both use **Node 24**, which is what the deployed site is actually built with; treat that as the tested configuration and `>=20` as the supported range. The workflow is a working reference even if you deploy differently.

---

## 3. Configure before going live

### 3a. `src/siteConfig.js` — six values

| Value | Change it to | Why it matters |
|---|---|---|
| `ACCESSIBILITY_CONTACT` | **An address your organization monitors** | AODA's Information and Communications standard expects a public Ontario site to offer a feedback process and accessible formats on request. This address is the *only* route the footer gives a user who hits a barrier. It points at Lakehead's Research Security & Data Management Services (RSDMS) inbox. |
| `INSTITUTION_RS_CONTACT` | **Your research security contact** (institution, name, title, monitored email) | Report a Concern tells researchers to start with their own institution, and the travel emergency block tells them to report back to it. This names who that is. Currently Lakehead's Research Security and Data Management Specialist. |
| `SITE_URL` | Your public URL, `https://`, no trailing slash | Filled into the canonical and Open Graph tags in `index.html` at build time. The build fails if it is not an absolute `https://` URL. |
| `WEB_HOST` | **Who serves the files**, e.g. `'Lakehead University web servers'` | Named on the How This Site Works page, which promises a *complete* list of every party that sees a request from the site. If a proxy or CDN sits in front, name it too (e.g. `'Cloudflare, which forwards them to Lakehead University web servers'`). Leaving it as `GitHub Pages` after moving makes the privacy page false. |
| `ENABLE_PROXIMITY_SEARCH` | `false` if no user input may leave the browser | The NRO map's proximity panel is the **only** feature that sends what a user types off the device (to OpenStreetMap and Wikipedia). `false` removes the panel and every mention of it on How This Site Works and in the FAQ. If you turn it off, also delete the two geocoder hosts from `connect-src` (in `index.html` and in your header CSP). |
| `SHOW_SISTER_SITE_CARD` | `false` if you don't want an off-site link | Controls the "RDM Toolkit" card at the bottom of the sidebar, which links to rdmtoolkit.ca — a separate project by the original author |

### 3b. `index.html` — nothing to edit for the domain

The canonical and Open Graph URLs are written as `%SITE_URL%` placeholders and filled in by a small plugin in `vite.config.js`, so `SITE_URL` above is the only place the domain lives. For a one-off build to a different host (e.g. staging) without editing the file:

```bash
SITE_URL=https://staging.example.lakeheadu.ca npm run build
```

### 3c. `package.json` — if you fork to your own organization

`repository.url` points at `github.com/seawaydigital/RSToolkit.git`, which is genuinely where this code originated. If you fork or re-host the repository under a Lakehead GitHub organization, update that field so `npm` and tooling resolve to the copy you actually maintain. Nothing breaks if you leave it — it is metadata, not a build input.

The MIT `LICENSE` retains the original copyright line. That is normal and correct for MIT: you may host, modify and redistribute freely, and the notice stays with the code.

### 3d. Ownership and branding

The site uses a Cobalt + Blaze palette aligned with Lakehead University branding, but **it makes no ownership claim anywhere in the UI** — no logo, no "published by", no institutional footer. That was deliberate: it is your decision, not ours. If you want attribution, `src/components/layout/SiteFooter.jsx` is the place, and it is a deliberately slim persistent bar (35px desktop / 61px mobile), so keep additions short.

---

## 4. Security headers — action required

`index.html` carries a **Content-Security-Policy** meta tag. Most CSP directives work that way, so what is left in the file is genuinely in effect.

**Two protections cannot be delivered from HTML and must be configured on your web server.** Both were previously in the HTML looking like protection while doing nothing:

- `X-Content-Type-Options` was a `<meta http-equiv>` tag. It is not a valid pragma directive at all, so browsers ignored it — it was never in effect.
- CSP's **`frame-ancestors`** (the anti-clickjacking directive) was in the meta CSP. Browsers explicitly ignore it outside an HTTP header, and it was logging a console error on every single page load.

Both have been removed from the HTML rather than left as false assurance. **Set them as HTTP response headers:**

```
X-Content-Type-Options: nosniff
Content-Security-Policy: frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Referrer policy is not in that group.** It is handled in the page by `<meta name="referrer" content="strict-origin-when-cross-origin">`, which *is* a valid and browser-honoured mechanism — unlike `http-equiv="Referrer-Policy"`, which is not. Do not "tidy" it back to `http-equiv`, and you do not need a server header for it. (Modern browsers already default to this value, so it is belt-and-braces.)

`frame-ancestors 'none'` is what stops the site being framed by another origin. If your stack does not let you add a CSP header, `X-Frame-Options: DENY` is the older equivalent and is honoured by every browser you care about — but do not set both to conflicting values.

**Recommended: send the whole CSP as a response header too**, with `frame-ancestors 'none'` added — the server configs in §4a below do exactly that. Keep the meta tag in `index.html` as well, so the page stays protected if a server config is ever lost. When a page has both, the browser enforces **both** (a request must pass each policy), so the two must list the same hosts: if you add a host to one and not the other, the stricter one silently blocks it. The policy, identical to the meta tag except for `frame-ancestors`:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://tiles.stadiamaps.com;
connect-src 'self' https://nominatim.openstreetmap.org https://en.wikipedia.org;
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'none';
frame-ancestors 'none';
```

Every allowance is in use and nothing else is: fonts are self-hosted (no Google Fonts), `img-src` is the three basemap providers plus `data:` for the inlined Leaflet marker icons, and `connect-src` is the two geocoders behind the NRO proximity panel. If `ENABLE_PROXIMITY_SEARCH` is `false`, reduce `connect-src` to `'self'`. If you use only one basemap provider, you may trim the other two from `img-src`.

`script-src` deliberately has **no** `'unsafe-inline'`. The production build emits one external module script and no inline scripts or handlers, so the allowance was never needed — and it is precisely what an injected `onerror=` attribute would need in order to execute. Do not add it back to silence a warning; find the source of the inline script instead. (`style-src` does still need `'unsafe-inline'`: React and Leaflet both set inline `style` attributes.)

### 4a. Hosting at Lakehead (or any server you control)

Serve `dist/` from a **dedicated subdomain** (e.g. `rs.<something>.lakeheadu.ca`), not a folder under an existing site. A browser treats everything on one origin as one trust zone: under a shared host, this site's saved checklists would be readable by every other application on that origin, and a flaw in any of them could reach this page. A dedicated subdomain keeps it isolated.

**Do not let the hosting platform inject anything into the page.** University web platforms often add analytics, accessibility overlays, tag managers or CMS banners to every page they serve (Siteimprove, Google Tag Manager, Matomo and similar). Here, that would be blocked by the CSP and break nothing visible. But it would also make the How This Site Works page false, because that page tells researchers there are no analytics and lists every outbound request. Serve the built files byte-for-byte.

Every config below does the same five things:
1. It sends the security headers on every response, including error responses.
2. It caches the hashed files in `assets/` for a year and makes browsers revalidate `index.html`.
3. It allows only `GET` and `HEAD`, because a static site has no use for any other method.
4. It turns off directory listings and server version banners.
5. It redirects HTTP to HTTPS.

Replace `rs.example.lakeheadu.ca` and the document root with your own values.

<details>
<summary><strong>nginx</strong></summary>

nginx has a trap here: an `add_header` inside a `location` block **discards every `add_header` inherited from the server block**. So the headers live in one include file, and every location that sets its own `Cache-Control` must include it again.

`/etc/nginx/snippets/rs-toolkit-headers.conf`:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://tiles.stadiamaps.com; connect-src 'self' https://nominatim.openstreetmap.org https://en.wikipedia.org; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Cross-Origin-Resource-Policy "same-origin" always;
```

Site config:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name rs.example.lakeheadu.ca;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name rs.example.lakeheadu.ca;
    # ssl_certificate / ssl_certificate_key: your institutional certificate

    root /var/www/rs-toolkit;      # the contents of dist/
    index index.html;
    server_tokens off;
    autoindex off;

    if ($request_method !~ ^(GET|HEAD)$) { return 405; }

    include snippets/rs-toolkit-headers.conf;

    location / {
        try_files $uri =404;       # hash routing: no SPA fallback needed
        add_header Cache-Control "public, max-age=86400" always;
        include snippets/rs-toolkit-headers.conf;
    }
    location = /index.html {
        add_header Cache-Control "no-cache" always;
        include snippets/rs-toolkit-headers.conf;
    }
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        include snippets/rs-toolkit-headers.conf;
    }
}
```

Requests for `/` are served from `index.html` by the `index` directive and pick up the `location = /index.html` headers.
</details>

<details>
<summary><strong>Apache httpd 2.4</strong> (needs <code>mod_headers</code>; <code>mod_ssl</code> for HTTPS)</summary>

```apache
# Server-wide (httpd.conf): hide version banners and disable TRACE
ServerTokens Prod
ServerSignature Off
TraceEnable Off

<VirtualHost *:80>
    ServerName rs.example.lakeheadu.ca
    Redirect permanent / https://rs.example.lakeheadu.ca/
</VirtualHost>

<VirtualHost *:443>
    ServerName rs.example.lakeheadu.ca
    DocumentRoot /var/www/rs-toolkit
    # SSLEngine on / SSLCertificateFile / SSLCertificateKeyFile: your certificate

    <Directory /var/www/rs-toolkit>
        Options -Indexes -Includes -ExecCGI -FollowSymLinks
        AllowOverride None
        <LimitExcept GET HEAD>
            Require all denied
        </LimitExcept>
        Require all granted
    </Directory>

    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://tiles.stadiamaps.com; connect-src 'self' https://nominatim.openstreetmap.org https://en.wikipedia.org; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()"
    Header always set Cross-Origin-Opener-Policy "same-origin"
    Header always set Cross-Origin-Resource-Policy "same-origin"

    Header set Cache-Control "public, max-age=86400"
    <LocationMatch "^/(index\.html)?$">
        Header set Cache-Control "no-cache"
    </LocationMatch>
    <Location "/assets/">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </Location>
</VirtualHost>
```
</details>

<details>
<summary><strong>IIS 10</strong> (<code>web.config</code> in the site root, next to <code>index.html</code>)</summary>

Bind the site to HTTPS only. For the HTTP→HTTPS redirect, use the URL Rewrite module or a separate port-80 site that redirects. IIS adds `Server` and `X-Powered-By` banners by default, and this config removes both.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <directoryBrowse enabled="false" />
    <httpProtocol>
      <customHeaders>
        <remove name="X-Powered-By" />
        <add name="Content-Security-Policy" value="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://tiles.stadiamaps.com; connect-src 'self' https://nominatim.openstreetmap.org https://en.wikipedia.org; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'" />
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
        <add name="Permissions-Policy" value="camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" />
        <add name="Cross-Origin-Opener-Policy" value="same-origin" />
        <add name="Cross-Origin-Resource-Policy" value="same-origin" />
      </customHeaders>
    </httpProtocol>
    <security>
      <requestFiltering removeServerHeader="true">
        <verbs allowUnlisted="false">
          <add verb="GET" allowed="true" />
          <add verb="HEAD" allowed="true" />
        </verbs>
      </requestFiltering>
    </security>
    <staticContent>
      <remove fileExtension=".woff2" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="1.00:00:00" />
    </staticContent>
  </system.webServer>
  <location path="index.html">
    <system.webServer>
      <staticContent><clientCache cacheControlMode="DisableCache" /></staticContent>
    </system.webServer>
  </location>
  <location path="assets">
    <system.webServer>
      <staticContent><clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" /></staticContent>
    </system.webServer>
  </location>
</configuration>
```
</details>

**About `includeSubDomains`:** on a dedicated subdomain this applies only to hosts *beneath* that subdomain, which normally don't exist, so it is safe. Do **not** set HSTS with `preload` on the parent `lakeheadu.ca` as part of this work; that is an institution-wide decision.

#### Verify the deployment

Run these after go-live. Replace the host with yours.

```bash
curl -sI https://rs.example.lakeheadu.ca/ | grep -iE "content-security|strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy|cross-origin|cache-control|^server"
```

Expect all eight security headers, `Cache-Control: no-cache`, and a `Server` header with no version number (or none at all).

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://rs.example.lakeheadu.ca/
```

Expect `405` or `403`.

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://rs.example.lakeheadu.ca/assets/
```

Expect `403` or `404`, not a file listing.

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://rs.example.lakeheadu.ca/
```

Expect `301` to the `https://` URL.

Then open the home page and `#nro-lookup` with the browser's developer tools open:
- The **Console** must show no CSP errors.
- The **Network** tab must show requests only to your host and the basemap provider.
- Pressing *Find* in the proximity panel should add a request to `nominatim.openstreetmap.org`.

Finally, scan the site with [MDN HTTP Observatory](https://developer.mozilla.org/en-US/observatory); these headers should score A+.

### 4b. Applying the headers on GitHub Pages: put Cloudflare in front

GitHub Pages cannot set response headers. The lowest-effort fix is Cloudflare's free plan as a proxy in front of `rs.rdmtoolkit.ca`. It takes about an hour and needs no change to the site's code.

**Know what moves before you start.** Cloudflare's free plan works by taking over DNS for the whole `rdmtoolkit.ca` domain, not just `rs`. As of 2026-09-24 the domain's nameservers are CanSpace's (`dns1.canspace.ca`, `dns2.canspace.ca`), and the zone contains at least: the apex `rdmtoolkit.ca` (four A records to GitHub Pages, `185.199.108.153`–`185.199.111.153`), `www` (CNAME to `seawaydigital.github.io`), `rs` (CNAME to `seawaydigital.github.io`), and an MX record. The apex and `www` serve the separate RDM Toolkit site. Export or screenshot the complete zone from CanSpace before changing anything.

1. **Add `rdmtoolkit.ca` to Cloudflare** on the free plan. When Cloudflare scans the existing DNS records, compare its list with the CanSpace zone line by line and add anything it missed — especially MX and TXT records (SPF, DKIM, domain verification).
2. **Set proxy status record by record.** `rs` → *Proxied* (orange cloud). The apex, `www`, MX and every other record → *DNS only* (grey cloud), so the RDM Toolkit site and any mail behave exactly as before.
3. **Switch nameservers.** At CanSpace, replace the nameservers with the two Cloudflare assigns. Wait until Cloudflare shows the zone as *Active*.
4. **SSL/TLS → Overview:** set the mode to *Full (strict)*. GitHub Pages already serves a valid certificate for `rs.rdmtoolkit.ca`. If GitHub later reports a certificate problem for the custom domain, set `rs` back to *DNS only* until GitHub reissues the certificate, then proxy it again.
5. **SSL/TLS → Edge Certificates:** turn on *Always Use HTTPS*, and turn on *HTTP Strict Transport Security (HSTS)* with max-age 12 months and include subdomains. Leave *preload* off — it is hard to undo and is a separate decision. Cloudflare adds the HSTS header only to proxied hostnames, so the grey-clouded apex and `www` are unaffected.
6. **Add the other headers with a response header transform rule** (in the dashboard under Rules; search for "response header" if the menu has moved). Create one rule whose expression is `(http.host eq "rs.rdmtoolkit.ca")`, with three *Set static* headers:
   - `X-Content-Type-Options` = `nosniff`
   - `Content-Security-Policy` = `frame-ancestors 'none'`
   - `Permissions-Policy` = `camera=(), microphone=(), geolocation=()`
7. **Verify.** This should print four lines:

   ```
   curl -sI https://rs.rdmtoolkit.ca/ | grep -iE "strict-transport|x-content-type|content-security|permissions-policy"
   ```

   Then load the home page and the NRO map with the browser console open and confirm there are no CSP errors, and load `https://rdmtoolkit.ca` to confirm the sister site is unaffected.
8. **Keep the privacy page true.** The How This Site Works page says page-load requests go to "The web host (GitHub Pages)", taken from `WEB_HOST` in `src/siteConfig.js`. Once Cloudflare is proxying, set `WEB_HOST` to `'Cloudflare, which forwards them to GitHub Pages'`, and add Cloudflare to the service table in section 5 of this file. The page states that its list of outbound requests is complete, so it must name every party that sees them.

**Leave these Cloudflare features off:** *Rocket Loader*, *Email Address Obfuscation* (under Scrape Shield), and *Web Analytics* / automatic RUM. The first two inject inline scripts, which the page's CSP (`script-src 'self'`) blocks, and that breaks the page. The third injects a third-party analytics beacon, which would make the site's "no analytics, no tracking" statement false. Leave caching at the defaults; the Vite build already uses hashed asset filenames.

### One CSP error you will see in development, and should ignore

Running `npm run dev` and opening the console shows:

```
Creating a worker from 'blob:...' violates the following Content Security
Policy directive: "script-src 'self'" ... has been blocked.
```

This is **Vite's dev-server HMR client** (`node_modules/vite/dist/client/client.mjs`), not application code. The production bundle contains zero `new Worker` calls — verified — so it cannot occur in a deployed build. Do not loosen `script-src` or add `worker-src` to silence it; you would be widening the shipped policy to accommodate a dev-only tool. Check the console against `npm run build` output rather than the dev server if you want a clean read.

---

## 5. Third-party services the site calls at runtime

Three external dependencies, and none of them is contacted on an ordinary page load. The map tiles load only on the NRO map, and the geocoders are called only when a user presses *Find*. The fonts (Archivo, Inter, JetBrains Mono) are **self-hosted**: they come from npm (`@fontsource-variable/inter`, `@fontsource-variable/archivo`, `@fontsource/jetbrains-mono`) and are bundled into `dist/assets/`, so no font service sees a visitor. `vite.config.js` stops Vite from inlining small font files as `data:` URIs, because the CSP's `font-src 'self'` would block them. Keep that setting.

| Service | Used for | If you must remove it |
|---|---|---|
| **Basemap tiles** — Esri (`server.arcgisonline.com`) by default, or CARTO (`*.basemaps.cartocdn.com`) / Stadia (`tiles.stadiamaps.com`) with a key | The NRO map background | The map needs a tile source. Providers are configured in `src/data/mapTiles.js`; add a new one there **and add its host to `img-src` in `index.html`**, or the tiles silently fail to load. See the note below. |
| **Nominatim** (`nominatim.openstreetmap.org`) | Primary geocoder for the NRO "Check proximity to NROs" panel | Set `ENABLE_PROXIMITY_SEARCH = false` in `src/siteConfig.js` and drop the host from `connect-src`. See the note below. |
| **Wikipedia** (`en.wikipedia.org`) | Fallback geocoder for the same panel, used only when Nominatim finds nothing | Same switch as Nominatim. |

**About the basemap — worth two minutes of your time.** The map plots Chinese, Russian and Iranian institutions, so **English place labels are a functional requirement**, not a preference. CARTO began enforcing API keys in August 2026, which is why the default is now keyless Esri. Esri renders Latin labels through zoom 10 — correct everywhere the UI actually navigates — but switches to local script (Hanzi / Cyrillic / Perso-Arabic) past that if a user zooms in manually.

Setting `VITE_CARTO_API_KEY` removes that caveat entirely and is the recommended production setup: the free tier is 5 million tile requests/month and needs no CARTO account. See `.env.example`. For the deployed site, add it as a GitHub Actions repository secret — `deploy.yml` already passes both `VITE_CARTO_API_KEY` and `VITE_STADIA_API_KEY` through to the build. **Never commit a real key.**

**About the two geocoders:** Nominatim is a free, volunteer-run OpenStreetMap service with a published usage policy that asks for an identifying User-Agent and discourages heavy or automated use. Current usage is interactive and low-volume — a user typing an institution name — which is within the spirit of that policy. The Wikipedia API is queried **only when Nominatim returns no match**, so it adds at most one extra request per search and none at all for institutions OpenStreetMap already knows.

The fallback exists because OpenStreetMap's coverage of universities outside Western Europe and North America is patchy — Minnan Normal University and Bauman Moscow State Technical University, for example, are not in OSM at all, and returned nothing before it was added. Wikipedia supplies article-level coordinates (main-campus centroid) rather than street addresses, which is why each suggestion in the UI is labelled with the source it came from.

Both are community services with no availability guarantee. If they are unreachable the proximity panel is the only thing that breaks; the rest of the NRO tool works. If your institution needs a guaranteed geocoder, that panel is the single place to swap one in — the two lookups are isolated in `geocodeNominatim()` and `geocodeWikipedia()` at the top of `NroLookup.jsx`.

---

## 6. Accessibility — what you are inheriting

The site targets **WCAG 2.0 AA**, the level AODA's IASR references.

- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** is the full record: what was remediated and why, the equivalent-alternative decisions, and the manual test checklist.
- `npm run lint` runs `eslint-plugin-jsx-a11y` as an automated regression gate. **Keep it at 0 errors.** It catches roughly 30% of WCAG issues — the checklist in ACCESSIBILITY.md §3 covers the rest and should be re-run after any significant UI change.
- Two deliberate equivalent-alternative decisions you should not undo without providing a replacement:
  - The **NRO data table** is the keyboard/screen-reader equivalent of the Leaflet map. Keep it complete and in sync with the map data.
  - **Guided Mode** is the keyboard/AT-accessible equivalent of the visual flowchart SVG. If Full View ever becomes the only route to node detail, those nodes must become real focusable controls.
- Manual keyboard and screen-reader testing was completed 2026-09-02. A formal third-party AODA audit is being carried out separately.

---

## 7. Maintaining the content

This is the part that needs a human who understands the policy, not just a developer.

Every tool displays a `lastUpdated` date from its data file in `src/data/`. Those dates are shown to users, so a stale one visibly undercuts the guidance.

**Current status:**

| Data file | `lastUpdated` | Verified? |
|---|---|---|
| `nroData.js` | 2024-04-18 | ✅ Diffed against the federal list 2026-09-02 — matches, no revision since |
| `straData.js` | 2026-07-30 | ✅ All 11 categories / 74 subcategories diffed clean 2026-09-02 |
| `reportConcernData.js`, `travelSecurityData.js` | 2026-09-02 | ✅ Current |
| `dualUseData.js` | 2026-06-19 | ✅ Current |
| `flowcharts/stracFlow.js` | 2026-09-06 | ✅ Verified against the STRAC policy page (dateModified 2026-07-29); policy unchanged since it took effect 2024-05-01 |
| `flowcharts/nsgrpFlow.js` | 2026-09-06 | ✅ Verified against the NSGRP page; every `policyRef` matches a real heading |
| `flowcharts/ontarioFlow.js` | 2026-09-06 | ✅ Verified against form **ON00708E (2024/06)**, the current Central Forms Repository version |
| `riskChecklist.js` | 2026-09-06 | ✅ Verified against NSGRP Annex A / Annex B structure |
| `cybersecurityData.js` | 2026-04-16 | ⚠️ Review |
| `faqData.js`, `glossaryData.js`, `riskMitigationData.js`, `triAgencyData.js` | 2026-03-31 | ⚠️ Review |
| `exportControlData.js` | 2026-09-06 | ⚠️ **Partially verified** — see below |

### What the 2026-09-06 verification did and did not cover

The four ✅ files were checked heading-by-heading against the live federal and provincial sources, and **that pass found real defects, not just stale dates**: the STRAC and Ontario flowcharts had been citing section numbers that do not exist in either document (STRAC uses descriptive headings; the Ontario guidelines number process *stages*), and `riskChecklist.js` cited "Annex A, Item 1–4" when Annex A does not number its items. All are corrected, and each file now carries a comment recording what was checked.

`exportControlData.js` is marked **partially** verified deliberately. Its source structure and every outbound link were confirmed, but the individual control-list entries were *not* re-derived against the current Export Control List, Controlled Goods List, and sanctions regulations — that means reading the schedules themselves. Read its date as "sources confirmed live", not "every entry re-checked". A researcher relying on a specific entry should still confirm it against the linked regulation.

The three files still marked ⚠️ Review are guidance and definitional content rather than legal lists; they are lower-risk but have not been re-read since their dates.

**When you re-verify:** update `lastUpdated` only on evidence, and leave a comment next to it recording what you checked, the way `nroData.js` and `straData.js` do. A date bumped on assumption is worse than an honestly old one.

Sanctions and the NRO list move fastest. Cross-check against the [Global Affairs Canada sanctions index](https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx).

---

## 8. Known gaps and deliberate omissions

Honest inventory of what is not finished.

- **Automated tests cover the flowchart graphs only.** `npm test` (Node's built-in runner, no dependencies) checks every flowchart for broken links, unreachable nodes and dead ends. There are no component or end-to-end tests. The other quality gates are `npm audit`, `npm run lint` (including the a11y rules), a clean production build, and the manual accessibility checklist. All of them run in CI on every pull request.
- **NRO map pin highlight is not wired.** Clicking a row in the NRO table highlights the row but not the corresponding map pin. Implementing it means holding refs to individual markers inside the cluster group and opening the popup programmatically. The dead prop that half-suggested this was removed; the idea is recorded here instead.
- **Three NRO city labels are known to be imprecise** (coordinates are correct in all three cases):
  - `33rd-tsnii` — labelled Moscow; actually in Shikhany-2, Saratov Oblast.
  - `peac-institute-of-multiscale-sciences` — labelled Mianyang; headquartered at Sichuan University, Chengdu.
  - `48th-central-scientific-research-institute` — has three branches (Sergiev Posad-6, Yekaterinburg, Kirov); the federal list carries one entry.
- **22 CAEP sub-institutes have approximate coordinates.** They sit inside the ~5 km² Mianyang Science City compound at deterministic offsets from `31.4974, 104.7589`. They render correctly but could be tightened with better public address data.
- **Flowchart Full View nodes are not keyboard-focusable.** This is the conforming-alternate-version route, not an oversight — Guided Mode is the accessible equivalent. See ACCESSIBILITY.md §4.

---

## 9. Where to look next

| Document | Contents |
|---|---|
| [README.md](README.md) | Tool inventory, tech stack, local development |
| [CLAUDE.md](CLAUDE.md) | Full architecture reference — conventions, design tokens, per-tool decisions, data shapes. The most detailed document here. |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | WCAG/AODA remediation record and the manual test checklist |
| [`src/data/toolRegistry.js`](src/data/toolRegistry.js) | Single source of truth for navigation and the home page |
| [`src/siteConfig.js`](src/siteConfig.js) | The six values you need to review |
| [SECURITY.md](SECURITY.md) | Security audit record, threat model, supply-chain controls, and how to report a vulnerability |
