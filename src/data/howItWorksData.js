// "How this site works" — the plain-language explanation of the toolkit's
// architecture and what that means for a researcher's data.
//
// Every claim on this page is a statement about the code in this repository,
// so it must be kept in step with the code. In particular:
//   - dataFlows lists EVERY outbound request the site makes. Adding a
//     third-party service (a tile provider, a geocoder, an analytics tag)
//     means adding a row here — and to the CSP in index.html.
//   - storage lists EVERY localStorage key the site writes. Adding one means
//     adding it here AND to STORAGE_KEYS below, which the "clear saved data"
//     button uses.
// Keep the wording honest. This page says "as safe as a website can be", not
// "100% safe", on purpose — see the limits section.

export const STORAGE_KEYS = ['rs-toolkit-checklist-v1', 'rs-toolkit-travel-v1'];

export const howItWorksData = {
  lastUpdated: '2026-09-18',
  sourceUrl: 'https://github.com/seawaydigital/RSToolkit',
  sourceLabel: 'View the source code',

  intro:
    'Researchers are rightly cautious about where they type details of their work. This page explains, in plain language, what happens when you use this toolkit, what does and does not leave your device, and why that makes it a safer place to think through research security questions than most of the alternatives.',

  headline: {
    title: 'Everything runs in your browser. Nothing you type is sent to us.',
    body:
      'This toolkit has no server behind it. There is no database, no login, no form that submits anywhere, and no analytics. The whole site is a bundle of files your browser downloads once — the policy data, the flowcharts, the checklists, the search engine — and then runs locally. Your search terms, wizard answers, and checklist selections are processed on your own device and never transmitted. We could not read them even if we wanted to, because they never reach us.',
  },

  steps: {
    title: 'How it works, step by step',
    items: [
      {
        title: 'Your browser downloads the site once',
        body:
          'Opening the toolkit fetches a fixed set of files from the web host: the page, one JavaScript bundle, the stylesheet, and the built-in reference data (the NRO list, the STRA categories, export-control summaries, and so on). This is exactly what happens when you read any web page.',
      },
      {
        title: 'Every tool then runs locally',
        body:
          'Searching the STRA list, walking a flowchart, answering the dual-use wizard, ticking the risk checklist — all of it is computed by code running inside your browser tab against the data it already has. No request is made to look anything up on a server.',
      },
      {
        title: 'Your inputs stay on your device',
        body:
          'What you type into a search box or choose in a wizard lives in the memory of the open tab. Two checklists also save your ticks in your browser\'s local storage so they survive a page refresh — see "What is saved on your device" below. Nothing is written anywhere else.',
      },
      {
        title: 'Closing the tab is the end of it',
        body:
          'There is no account to remember you and no session on a server to expire. Close the tab and, apart from the two saved checklists, no trace of what you did exists anywhere.',
      },
    ],
  },

  dataFlows: {
    title: 'What does leave your browser — the complete list',
    intro:
      'A web page has to talk to the internet to load at all, so "nothing leaves" is never literally true of any site. Here is every outbound request this toolkit makes, when it makes it, and what the other end can learn. This list is complete: it matches the site\'s Content Security Policy, which the browser enforces and which blocks any request not on it.',
    columns: ['When', 'What is sent', 'To whom', 'What they can learn'],
    rows: [
      {
        when: 'Every page load',
        what: 'A request for the site files',
        to: 'The web host (GitHub Pages)',
        learn: 'That your IP address opened the site. Not which tool you used or what you typed — the URL after the # is never sent to a server.',
      },
      {
        when: 'Every page load',
        what: 'A request for three font files',
        to: 'Google Fonts',
        learn: 'That your IP address loaded a page using these fonts. Nothing about the page content or your activity.',
      },
      {
        when: 'Only on the NRO map',
        what: 'Requests for map image tiles',
        to: 'The basemap provider (Esri by default)',
        learn: 'Which areas of the world map you looked at and how far you zoomed in. Not your search text, and not which pins you clicked.',
      },
      {
        when: 'Only when you press "Find" in the proximity panel on the NRO map',
        what: 'The institution name you typed',
        to: 'OpenStreetMap (Nominatim), and Wikipedia only if OpenStreetMap finds nothing',
        learn: 'That someone at your IP address looked up that institution name. This is the one feature that sends what you type, and it is designed for an institution name, not project details.',
        highlight: true,
      },
    ],
    outro:
      'That is the whole list. Nothing you enter in the STRA Lookup, the NRO organization search, the Export Control reference, the Glossary, the FAQ, any flowchart, either wizard, or either checklist is ever transmitted.',
  },

  storage: {
    title: 'What is saved on your device',
    body:
      'Two tools remember your progress between visits by writing to your browser\'s local storage — a small per-site store that only this site can read, that never leaves your device, and that is not a cookie (it is not sent with requests).',
    items: [
      { tool: 'Risk Assessment Checklist', slug: 'risk-checklist', what: 'Which items you marked "No risk", "Risk identified", or "N/A".' },
      { tool: 'Research Travel Security', slug: 'travel-security', what: 'Which travel checklist items you have ticked.' },
    ],
    caution:
      'On a shared or public computer, clear this before you leave. The button below removes everything this site has saved on this device; so does clearing site data in your browser settings.',
    clearButton: 'Clear everything this site has saved on this device',
    clearedMessage: 'Cleared. The two checklists will start fresh next time you open them.',
  },

  comparison: {
    title: 'How this compares with the alternatives',
    intro:
      'The question that matters is not "is this site secure?" but "where do the details of my research end up?" Here is the honest comparison with the other ways researchers commonly work through these questions.',
    columns: ['Option', 'Where your details go', 'What can go wrong'],
    rows: [
      {
        option: 'This toolkit',
        where: 'Nowhere. Processed in your browser and discarded (or, for two checklists, saved only on your device).',
        risk: 'There is nothing stored to breach, subpoena, or leak, because the site never receives your inputs. Exposure is the same as reading a web page.',
        self: true,
      },
      {
        option: 'Asking a consumer AI chatbot',
        where: 'To the vendor\'s servers, where prompts are typically retained and, under most consumer terms, may be used to train future models.',
        risk: 'Describing an unpublished method, a partner, or a grant strategy to a chatbot can put it into a third party\'s data indefinitely. This is a documented research-security concern — see the Cybersecurity guide.',
        crossLink: 'cybersecurity-guide',
      },
      {
        option: 'A hosted compliance portal or web form',
        where: 'Into a database on someone else\'s server, tied to your account.',
        risk: 'Whatever you enter is stored, backed up, and reachable by whoever administers the system. Its security is only as good as that vendor\'s, and a breach there is a breach of your research plans.',
      },
      {
        option: 'Emailing a colleague or consultant for advice',
        where: 'Copied across at least two mail servers and into every mailbox it is forwarded to.',
        risk: 'Email is durable and travels. Details shared "just to ask a quick question" persist in inboxes you do not control and may be forwarded, quoted, or discovered later.',
      },
      {
        option: 'A downloaded spreadsheet or PDF checklist',
        where: 'Stays on your device — as safe as this toolkit.',
        risk: 'Nothing, security-wise. The trade-off is that it is static: it cannot search live lists, walk a decision tree, or be updated when policy changes.',
      },
    ],
  },

  safeguards: {
    title: 'Safeguards built into the site',
    intro:
      'For research security officers and IT reviewers, these are the concrete measures in place. Each one is verifiable in the public source code.',
    items: [
      {
        title: 'No server-side code',
        body: 'The site is a static bundle. There is no application server, no API, and no database — so there is no server-side attack surface and nothing that could log your inputs.',
      },
      {
        title: 'A strict Content Security Policy',
        body: 'The page carries a browser-enforced policy that permits scripts only from the site itself (no inline scripts, no third-party scripts), permits network connections only to the two geocoders listed above, and forbids form submissions entirely. If the code tried to send data anywhere else, the browser would block it.',
      },
      {
        title: 'No cookies, no analytics, no trackers',
        body: 'The site sets no cookies and loads no analytics or advertising scripts. There is no visitor counter. We do not know how many people use the site, let alone who.',
      },
      {
        title: 'Third-party responses are treated as untrusted',
        body: 'The only outside data the site renders at runtime is the geocoder result on the NRO map. It is escaped before display so that a tampered map name could not inject code into the page.',
      },
      {
        title: 'Open source and auditable',
        body: 'The complete source code is public. Anyone — including your institution\'s IT security team — can read exactly what the site does, build it themselves, and confirm it matches what is deployed.',
      },
      {
        title: 'Dependencies are audited',
        body: 'The handful of open-source libraries the site is built from (React, Leaflet, Fuse.js, dagre, lucide) are checked against the npm vulnerability database and updated when advisories appear.',
      },
      {
        title: 'Served over HTTPS',
        body: 'All traffic between your browser and the host is encrypted in transit, so a network observer sees that you visited the site, not what you did on it.',
      },
    ],
  },

  verify: {
    title: 'Check it yourself',
    intro: 'You do not have to take our word for any of this. Three ways to confirm it in under five minutes:',
    items: [
      {
        title: 'Watch the network',
        body: 'Open your browser\'s developer tools (F12, or right-click → Inspect) and choose the Network tab. Then use any tool on this site: search the STRA list, run the dual-use wizard, tick a checklist. You will see no requests appear. The only exceptions are map tiles when you open the NRO map, and the geocoder call when you press "Find" in the proximity panel.',
      },
      {
        title: 'Read the policy',
        body: 'In the same developer tools, open the Elements tab and find the <meta http-equiv="Content-Security-Policy"> tag near the top of the page. The connect-src line is the complete list of servers the site is allowed to talk to.',
      },
      {
        title: 'Read the code',
        body: 'The source is linked at the top of this page. Your IT security office can review it, or build and host their own copy on institutional infrastructure if your policy requires it — the site is designed to be host-neutral.',
      },
    ],
  },

  limits: {
    title: 'What this does not mean',
    items: [
      'It does not make the site "100% safe" — no website is. It means the site\'s own design gives it nothing of yours to lose. Your device, your browser, and your network are still yours to secure; the Cybersecurity guide covers that.',
      'It does not make the content legal advice. The toolkit explains policy; your institution\'s research security office makes determinations.',
      'It does not make the proximity search private. That one feature sends the institution name you type to OpenStreetMap and, if needed, Wikipedia. Use it for institution names only.',
      'It does not protect a shared computer. The two saved checklists sit in that browser\'s local storage until cleared — use the button above before you walk away.',
    ],
  },
};
