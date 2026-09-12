# Release, maintenance and containment

Owner: Andrew Austin at Lakehead University. Reporting address supplied by the owner: security.research@lakeheadu.ca. No separate backup maintainer or institutional endorsement is assumed.

## Release process

1. Use Node 24.21.0. From a clean checkout run npm ci, npm audit --audit-level=low, npm run verify, npx playwright install chromium firefox webkit, and npm run test:e2e.
2. Inspect source changes through scripts/check-sources.js, scripts/reconcile-nro.js and scripts/reconcile-stra.js. The availability script can fail for bot protection; investigate and record actual content inspection instead of editing a date to make the check green.
3. Complete docs/owner-acceptance.md. Update releaseStatus, source dates and the closure record only from actual evidence.
4. Run node scripts/build-release-manifest.js. Retain the revision, dist file hashes, browser report, source-diff evidence and tested containment artifact. Test artifacts contain synthetic data and should not become a public case database.
5. CI's verify job produces a release artifact without deployment permissions. master requires a passing verify status when branch protection is applied. No external approver is needed, but Andrew makes the final publication decision.
6. The owner chose another host, to be selected at release. The build is portable. public/_headers targets hosts supporting that format; public/.htaccess targets Apache with mod_headers/mod_rewrite. Choose one supported configuration. A file in dist is not evidence the host honors it.
7. Configure TLS, HTTP-to-HTTPS redirection, CSP including frame-ancestors, nosniff, referrer policy, permissions policy and HSTS on that host. Cache index.html with revalidation; hashed assets can be immutable. Do not impose includeSubDomains/preload on unrelated domains.
8. Keep the new host on a staging hostname until source files, font/MIME handling, all routes, storage defaults and real headers pass. Run node scripts/check-production.js https://EXACT-STAGING-HOST and repeat against the real domain after the owner authorizes the DNS/release switch. Keep canonical metadata aligned with the chosen host.
9. Verify domain ownership and recovery through the actual registrar/DNS/host interfaces, and account MFA/recovery. Their state cannot be inferred from repository contents. Do not paste credentials into a chat or public issue.

On 12 September 2026 the existing domain points directly to GitHub Pages. HTTPS enforcement was enabled and an HTTP redirect observed. It still lacks the required custom response headers. Moving the candidate to another host is an explicit pending release decision. The existing public site has not received this candidate's source changes.

## Material error or security report

Use a synthetic reproduction. Separate confirmed facts from a report. Do not collect unnecessary identities or confidential research; arrange an approved channel before receiving sensitive details. An urgent institutional incident goes through that institution's incident process.

For a wrong obligation, identity inference or disclosure risk, stop the affected guidance promptly. Record the affected versions, source conflict and decision. Build the containment fallback:

PowerShell:
```powershell
$env:VITE_CONTAINMENT = '1'
npm run build
npm run test:e2e
Remove-Item Env:VITE_CONTAINMENT
```

POSIX:
```sh
VITE_CONTAINMENT=1 npm run build
VITE_CONTAINMENT=1 npm run test:e2e
```

The fallback disables preparation tools and keeps About, official sources and reporting available. Its dedicated browser suite must pass. Save it under a separate, clearly labelled release artifact before rebuilding the normal candidate. A workflow_dispatch containment input builds the same mode in CI. Publish only the explicitly selected artifact after authorization.

For a single affected tool, add its slug to releaseStatus.disabledTools and verify route/search/navigation behavior. Standard policy-journey tests may deliberately fail when a formerly available tool is disabled; use the tested containment mode for urgent full withdrawal.

Publish a dated correction in the About correction record and identify affected outputs. Correct code/content with a new version, rerun affected source and regression checks, and restore only after a successful candidate. There are no user accounts or mailing list: the public correction page cannot recall old PDFs or guarantee every former visitor is reached.

## Rollback

Retain the last known-good candidate and the tested source-links fallback. Do not roll back to the old audit baseline merely because it builds: its RAF logic and map behavior are known unsafe for this scope.

Rehearsal: build the containment artifact, verify all tool routes are disabled while official help remains, rebuild the normal candidate, and verify the restored journeys. Host-level promotion, cache purge and rollback are rehearsed on the chosen staging host before publication. Keep DNS rollback distinct from artifact rollback; allow for caching and certificate provisioning.

## Sustainable review

RC2 visual tools: follow [visual-tools-restoration.md](visual-tools-restoration.md) for location provenance and explicit review of candidate snapshots. The map review deadline is separate from the official NRO-list review. Missing sources stay unmapped. Never copy geocoder candidates into production automatically or revive legacy coordinates. At staging, verify that local use has no external requests, each opt-in works and revocation stops new requests. Provider tests in CI use fixtures; do not run automated pan/zoom or bulk downloads against live OpenStreetMap tiles. Review provider terms before release or a provider change. The CSP permits en.wikipedia.org connections and tile.openstreetmap.org images only for these features.

Andrew reviews reports promptly when available, checks source availability and dependencies weekly, and reviews consequential content at least monthly and immediately when a material official change is identified. This is an operating plan, not a promised response-time service level. Dependabot proposes dependency/action updates; its proposals still need verification.

The first source review deadline is 12 October 2026. Before extending it, compare actual official definitions, program scope, dates, forms and lists. Keep a change log and test the relevant counterexamples. Reconcile data into artifacts before changing bundled records.

If maintenance or reporting cannot be sustained, publish the tested fallback and a retirement notice. Do not keep moving review dates forward or leave an unsupported decision tool appearing current. With no backup person available, withdrawal is the continuity plan.

## Evidence retention

Retain release/source manifests and compact reports with the release. Keep private security reports in an approved institutional location under the applicable retention/access rules, not the source repository. Public logs and screenshots must use synthetic examples. CI artifacts expire after 14 days (failure artifacts after 7); preserve required release evidence separately. Clearing site storage does not clear user-produced PDFs.
