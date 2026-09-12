# Research Security Toolkit

A static, English-language reference and preparation resource for Canadian researchers and research security professionals. Operator: Andrew Austin at Lakehead University. Contact: security.research@lakeheadu.ca. Institutional links and the operator's affiliation do not assert formal endorsement.

**Release candidate 0.1.0-rc.1.** This branch implements the [two-person launch plan](docs/two-person-launch-plan.md). See the [closure record](docs/launch-closure-record.md) for evidence and remaining release decisions. The live rs.rdmtoolkit.ca site is separate from this unpromoted candidate.

## Scope

Twelve tools cover selected federal and Ontario requirements, official NRO names/aliases, STRA categories, preparation worksheets, mitigation, export/sanctions references, cybersecurity, FAQ and glossary. They do not issue funding, legal or institutional clearance.

- NRO: 103 official organization entries, 252 aliases; exact names, aliases and possible candidates are labelled separately.
- STRA: 11 categories, 74 named subcategories and one explicitly labelled category overview. User assessment replaces the old likelihood classifier.
- Worksheets are temporary unless explicitly saved to this browser. A new worksheet starts blank; resume is explicit and version-validated.
- Search runs locally. No map, geocoder, analytics or remote fonts are used. Hosting access logs and external links still have their own privacy implications.
- dual-use, travel-security and report-concern, added on newer master after the audit baseline, are preserved in source but unavailable in this bounded release.

## Develop and verify

Use Node 24.21.0 and npm. No API keys are needed.

```text
npm ci
npm run verify
npx playwright install chromium firefox webkit
npm run test:e2e
node scripts/serve-candidate.js
```

The last command serves the production build at http://127.0.0.1:4187 with the candidate response headers. It is a loopback verification server, not a production service. npm run dev provides Vite development mode. Set BASE_PATH only when hosting under a subdirectory.

Source maintenance tools produce review artifacts and do not automatically publish or approve new guidance:

```text
node scripts/check-sources.js
node scripts/reconcile-nro.js
node scripts/reconcile-stra.js
node scripts/build-release-manifest.js
```

An HTTP success means availability, not policy correctness. FNIGC may reject automated fetches; record manual source inspection instead of suppressing the failure.

## Release and maintenance

[Operations runbook](docs/operations-runbook.md), [owner acceptance script](docs/owner-acceptance.md), [policy matrix](docs/policy-rule-matrix.md), [accessibility scope](ACCESSIBILITY.md), [security reporting](SECURITY.md).

CI requires lint, unit/policy tests, data/source-date integrity, a production build, browser tests and an advisory check. It uploads a candidate artifact; it has no publication step. Choose a host that supports the supplied response headers and verify actual responses after authorized deployment. GitHub Pages cannot apply the supplied custom header files.

The original software license is [MIT](LICENSE), retained from master. Third-party software/font notices are generated into the build from the installed packages. Government policies, linked works and third-party marks retain their own terms. OCAP® is a registered trademark of FNIGC.
