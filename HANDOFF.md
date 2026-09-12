# Deployment and maintenance handoff

The earlier map-based handoff is superseded. RC2 restores visual diagrams and a newly sourced map under the safeguards in [visual-tools-restoration.md](docs/visual-tools-restoration.md); legacy map coordinates and assumptions remain unvalidated.

Start with [README](README.md), the [operations runbook](docs/operations-runbook.md), [closure record](docs/launch-closure-record.md) and [owner acceptance script](docs/owner-acceptance.md).

Node 24.21.0 is pinned. npm ci and npm run verify produce the portable dist directory, including license notices. Run npm run test:e2e. No application secrets or map keys are required.

Publishing is deliberately separate from building. The owner chose to prepare another host and select it at release. Custom response header candidates are provided for _headers-compatible hosts and Apache. Their presence in dist does not prove a host applies them. GitHub Pages ignores them.

For urgent containment, build with VITE_CONTAINMENT=1, run its browser suite, and publish the tested fallback only after authorization. Keep the previously tested fallback independently of a normal application release. See the runbook for rollback, retention, source refresh and discontinuation.
