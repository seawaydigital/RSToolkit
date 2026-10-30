#!/usr/bin/env bash
# Install a release built by build-release.sh on the web server, and switch
# the live site to it. Runs on the server (Linux, GNU coreutils and tar).
#
#   install-release.sh rs-toolkit-<id>.tar.gz   verify, unpack, switch live
#   install-release.sh --rollback               switch back to the previous release
#   install-release.sh --switch <id>            switch to any installed release
#   install-release.sh --list                   show installed releases
#
# The web server's document root ($LIVE) is a symlink to one directory under
# $RELEASES. Switching replaces the symlink in a single rename, so a visitor
# never sees a half-copied site, and rolling back takes the same one step.
# See HANDOFF.md section 2a.
set -euo pipefail

# Both live under one directory owned by the deploy account, so it never
# needs write access to /var/www itself.
LIVE=${LIVE:-/var/www/rs-toolkit/current}
RELEASES=${RELEASES:-/var/www/rs-toolkit/releases}
KEEP=${KEEP:-5}

die() { echo "error: $*" >&2; exit 1; }

log() {
  printf '%s\t%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$(id -un)" "$*" >> "$RELEASES/deploy.log"
}

# Installed releases, oldest first. Ids start with a UTC timestamp, so a
# plain name sort is chronological.
releases() {
  find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -name '[0-9]*' -printf '%f\n' | sort
}

current() {
  [ -L "$LIVE" ] && basename "$(readlink "$LIVE")" || true
}

switch_to() {
  local target="$RELEASES/$1"
  [ -f "$target/index.html" ] || die "no installed release '$1' (see --list)"
  if [ -e "$LIVE" ] && [ ! -L "$LIVE" ]; then
    die "$LIVE is a real directory, not a symlink. Move it aside once (HANDOFF.md 2a) and retry."
  fi
  local tmp="$LIVE.switching.$$"
  ln -s "$target" "$tmp"
  mv -T "$tmp" "$LIVE"
  log "live -> $1"
  echo "Live site now serves release $1"
}

prune() {
  local live keep_from
  live=$(current)
  keep_from=$(( $(releases | wc -l) - KEEP ))
  [ "$keep_from" -gt 0 ] || return 0
  releases | head -n "$keep_from" | while read -r old; do
    [ "$old" = "$live" ] && continue
    rm -rf -- "${RELEASES:?}/$old"
    log "pruned $old"
  done
}

install() {
  local tarball=$1 name id dest partial
  name=$(basename "$tarball")
  [[ "$name" =~ ^rs-toolkit-([0-9]{8}T[0-9]{6}Z-[0-9a-f]+)\.tar\.gz$ ]] \
    || die "'$name' is not named like a build-release.sh tarball"
  id=${BASH_REMATCH[1]}
  dest="$RELEASES/$id"
  [ ! -e "$dest" ] || die "release $id is already installed; use --switch $id"

  # The checksum catches a truncated or corrupted copy. It does not prove who
  # built the file -- that depends on how the file reached this server.
  [ -f "$tarball.sha256" ] || die "missing $tarball.sha256 (copy it alongside the tarball)"
  (cd "$(dirname "$tarball")" && sha256sum --check --quiet "$name.sha256") \
    || die "checksum does not match; do not install this file"

  # Refuse absolute paths, '..' and anything that is not a plain file or directory.
  if tar -tzf "$tarball" | grep -Eq '^/|(^|/)\.\.(/|$)'; then
    die "tarball contains unsafe paths"
  fi
  if tar -tvzf "$tarball" | grep -Eqv '^[-d]'; then
    die "tarball contains links or special files"
  fi

  partial="$RELEASES/.partial-$id"
  rm -rf -- "$partial"
  mkdir -p "$partial"
  tar -xzf "$tarball" -C "$partial" --no-same-owner --no-same-permissions
  [ -f "$partial/index.html" ] || { rm -rf -- "$partial"; die "tarball has no index.html at its root"; }
  # Readable by the web server, writable only by the deploying account.
  chmod -R u=rwX,go=rX "$partial"
  mv "$partial" "$dest"
  log "installed $id from $name"
  echo "Installed release $id"

  switch_to "$id"
  prune
}

mkdir -p "$RELEASES"

case "${1:-}" in
  --list)
    live=$(current)
    releases | while read -r r; do
      [ "$r" = "$live" ] && echo "$r  <- live" || echo "$r"
    done
    ;;
  --switch)
    [ -n "${2:-}" ] || die "usage: $0 --switch <id>"
    switch_to "$2"
    ;;
  --rollback)
    live=$(current)
    [ -n "$live" ] || die "$LIVE is not a release symlink yet; nothing to roll back"
    prev=$(releases | grep -B1 -x -- "$live" | head -n 1 || true)
    [ -n "$prev" ] && [ "$prev" != "$live" ] || die "no release older than $live is installed"
    switch_to "$prev"
    ;;
  -h|--help|"")
    sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'
    ;;
  *)
    [ -f "$1" ] || die "no such file: $1"
    install "$1"
    ;;
esac
