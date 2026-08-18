# Code-OSS Upstream Import & Sync

GitCortex Studio is built on the Code-OSS (Visual Studio Code open-source) engine. This document explains how that engine is imported and kept in sync, without polluting our product tree.

## Why a versioned snapshot

We import Code-OSS as a **versioned snapshot** rather than a live git submodule pointing at `microsoft/vscode` main:

- **Reproducible builds.** A pinned version compiles the same way every time.
- **Controlled updates.** We rebase upstream updates deliberately, after validating against our branding patches.
- **Clean history.** Our product commits are not mixed with a giant upstream tree churn.

## Import procedure

The Code-OSS source is imported into a `code-oss/` subtree at a pinned tag (e.g. `1.95.x`).

```bash
# 1. Import the engine at a pinned version (one-time, then committed)
./build/gitcortex/import-upstream.sh <vscode-tag>
```

This creates the `code-oss/` tree and records the upstream version in `code-oss/.upstream-version`.

## How we modify upstream

We do **not** edit files inside `code-oss/` directly. Instead:

1. Focused modifications (product name, default theme, branding strings) are expressed as patch files in `patches/`.
2. `yarn gitcortex:brand` applies these patches to `code-oss/` at build time.
3. The `code-oss/` tree therefore stays close to pristine, and upstream syncs are clean rebases.

## Sync procedure

To pull a new upstream version:

```bash
# 1. Record current state
git checkout -b sync/upstream-<new-tag>

# 2. Import the new engine version
./build/gitcortex/import-upstream.sh <new-vscode-tag>

# 3. Re-apply branding patches; resolve any conflicts
yarn gitcortex:brand

# 4. Validate the build
yarn install && yarn compile

# 5. Open a PR for review
```

## What stays untouched

The following are explicitly preserved from upstream and never patched in a breaking way:

- The `vscode` extension API surface and its stability guarantees.
- The Debug Adapter Protocol (DAP) and Language Server Protocol (LSP) implementations.
- The Monaco editor core.
- The xterm.js terminal front-end.

If a branding change would require modifying one of these, it is escalated to a design review before landing.

## License attribution

Code-OSS is MIT-licensed. The original `LICENSE.txt` and `ThirdPartyNotices.txt` from upstream are preserved in `code-oss/`. GitCortex Studio's own product code is also MIT.
