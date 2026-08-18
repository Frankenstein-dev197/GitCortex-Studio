# GitCortex Studio

> A professional developer IDE built on the Code-OSS (VS Code) engine — with a built-in AI agent, extension platform, and a modern developer-first interface.

GitCortex Studio is a standalone developer platform that inherits the proven editing core of Visual Studio Code (Monaco editor, extension host, integrated terminal, debugger, source control) and layers a new product identity, a developer-oriented UI, and an AI agent pipeline on top of it.

```
Developer
   │
   ▼
┌─────────────────────────────────────────────┐
│  GitCortex Studio Workbench                │
│  Projects · AI · Cloud · Extensions · SCM │
└─────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────┐
│  GitCortex AI Agent                        │
│  User → AI → Project → Files → Terminal    │
│              → Tests → Deploy              │
└─────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────┐
│  Editing Core (Code-OSS engine)            │
│  Monaco · Terminal · Debug · Extensions    │
└─────────────────────────────────────────────┘
```

## What this is

- **Not a reskin.** A new product with its own identity, configuration, product metadata, themes, and extension surface.
- **Not a fork that discards features.** The full editing, terminal, debugging, and extension-host capabilities of Code-OSS are preserved.
- **An AI-first IDE.** A first-class agent pipeline that can drive project work end-to-end.

## Repository layout

```
GitCortex-Studio/
├── docs/                      # Architecture, branding, AI design
│   ├── ARCHITECTURE.md
│   ├── BRANDING.md
│   ├── AI_AGENT.md
│   └── BUILD.md
├── product/                  # GitCortex product configuration (replaces OSS product.json surface)
│   └── product.json
├── resources/                # Logos, icons, splash, themes
│   ├── logos/
│   ├── icons/
│   └── themes/
├── src/                       # GitCortex-specific source (new UI, AI wiring)
│   ├── workbench/
│   └── ai/
├── extensions/                # GitCortex Extension Platform
│   ├── gitcortex-ai/
│   ├── gitcortex-theme/
│   └── gitcortex-tools/
├── build/                     # GitCortex build scripts wrapping the OSS build
├── CODE-OSS-UPSTREAM.md      # How the Code-OSS base is imported & kept in sync
├── CONTRIBUTING.md
└── README.md
```

> The Code-OSS (microsoft/vscode) source is imported under a versioned upstream snapshot. See [`CODE-OSS-UPSTREAM.md`](./CODE-OSS-UPSTREAM.md) for the import and sync procedure.

## Quick start

```bash
# 1. Install dependencies (requires Node 20+, Python 3, and build tools)
yarn install

# 2. Compile the workbench/editor
yarn compile

# 3. Launch the desktop app
yarn launch
```

See [`docs/BUILD.md`](./docs/BUILD.md) for the full, reproducible build.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Branding guide](docs/BRANDING.md)
- [GitCortex AI Agent](docs/AI_AGENT.md)
- [Build & validation](docs/BUILD.md)
- [Contributing](CONTRIBUTING.md)
- [Code-OSS upstream sync](CODE-OSS-UPSTREAM.md)

## License

GitCortex Studio is distributed under the MIT license. The Code-OSS engine portions remain under their original MIT license (see `Code-OSS` upstream and `ThirdPartyNotices.txt`).

## Acknowledgements

GitCortex Studio builds on the work of the VS Code team and the broader Monaco / Code-OSS community.
