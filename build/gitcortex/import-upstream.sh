#!/usr/bin/env bash
# Import the Code-OSS (microsoft/vscode) engine into the code-oss/ subtree at a pinned tag.
# Usage: ./build/gitcortex/import-upstream.sh <vscode-tag-or-ref> [upstream-remote]
#
# This is the single, reproducible entry point for bringing the engine in.
# It does NOT edit the upstream tree; branding is applied separately by `yarn gitcortex:brand`.
set -euo pipefail

VSREF="${1:-}"
REMOTE="${2:-https://github.com/microsoft/vscode.git}"

if [ -z "$VSREF" ]; then
  echo "Usage: $0 <vscode-tag-or-ref> [upstream-remote]" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="$ROOT/code-oss"
VERSION_FILE="$DEST/.upstream-version"

echo "==> Importing Code-OSS from $REMOTE @ $VSREF into $DEST"

if [ -d "$DEST/.git" ]; then
  echo "   (existing code-oss checkout detected; fetching $VSREF)"
  git -C "$DEST" fetch --depth 1 "$REMOTE" "$VSREF"
  git -C "$DEST" checkout "$VSREF"
else
  echo "   (no existing checkout; shallow-cloning $VSREF)"
  rm -rf "$DEST"
  git clone --depth 1 --branch "$VSREF" "$REMOTE" "$DEST" 2>/dev/null || {
    # branch flag fails for arbitrary SHAs; fall back to full-shallow then checkout
    git clone --depth 1 "$REMOTE" "$DEST"
    git -C "$DEST" fetch --depth 1 "$REMOTE" "$VSREF"
    git -C "$DEST" checkout "$VSREF"
  }
fi

# Record the exact upstream version for reproducible builds and clean syncs.
git -C "$DEST" rev-parse HEAD > "$VERSION_FILE" 2>/dev/null || true
git -C "$DEST" describe --tags 2>/dev/null >> "$VERSION_FILE" || true
echo "$REMOTE" >> "$VERSION_FILE"
echo "$VSREF" >> "$VERSION_FILE"

echo "==> Code-OSS imported at:"
cat "$VERSION_FILE"
echo
echo "==> Done. Apply branding with: yarn gitcortex:brand"
