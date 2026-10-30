#!/usr/bin/env bash
# Build a deployable release of the site: run every CI gate, build dist/,
# and package it as release/rs-toolkit-<id>.tar.gz plus a .sha256 file.
#
# Run from a clean checkout of the commit you want to ship:
#   SITE_URL=https://rs.example.lakeheadu.ca scripts/build-release.sh
#
# SITE_URL is optional (it defaults to SITE_URL in src/siteConfig.js), but
# WEB_HOST is not overridable -- set it in src/siteConfig.js and commit first.
# Map-tile keys, if any, are read from VITE_CARTO_API_KEY / VITE_STADIA_API_KEY.
# See HANDOFF.md section 2a.
set -euo pipefail

cd "$(dirname "$0")/.."

# A release must be reproducible from a commit, so refuse uncommitted changes.
if [ -n "$(git status --porcelain)" ] && [ "${ALLOW_DIRTY:-}" != "1" ]; then
  echo "error: the working tree has uncommitted changes. Commit or stash them," >&2
  echo "       or set ALLOW_DIRTY=1 for a throwaway test build." >&2
  exit 1
fi

sha=$(git rev-parse --short=12 HEAD)
id="$(date -u +%Y%m%dT%H%M%SZ)-${sha}"
name="rs-toolkit-${id}.tar.gz"

# The same gates as the CI verify job, in the same order.
npm ci
npm audit --audit-level=high
npm run lint
npm test
npm run build

mkdir -p release
tar -czf "release/${name}" -C dist .
(cd release && sha256sum "${name}" > "${name}.sha256")

canonical=$(grep -o '<link rel="canonical" href="[^"]*"' dist/index.html | sed 's/.*href="//; s/"$//')

echo
echo "Release built from commit ${sha}:"
echo "  release/${name}"
echo "  release/${name}.sha256"
echo
echo "Canonical URL baked into this build: ${canonical}"
echo "If that is not the address it will be served from, rebuild with SITE_URL set."
