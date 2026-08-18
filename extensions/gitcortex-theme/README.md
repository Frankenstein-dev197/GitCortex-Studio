# GitCortex Theme

The default color theme family for **GitCortex Studio**.

## Themes

- **GitCortex Dark** (`gitcortex-dark`) — the default dark identity theme. Deep navy workbench (`#0b1120`), blue accent (`#3b82f6`) for editor chrome, and a distinct purple AI accent (`#8b5cf6`) for GitCortex AI surfaces.
- **GitCortex Light** (`gitcortex-light`) — a high-contrast light companion.

## GitCortex color tokens

The themes define custom `gitcortex.*` theme color tokens that GitCortex UI (the AI panel, cloud workspace, marketplace views) consumes to keep AI-driven surfaces visually distinct from regular editor chrome:

| Token | Dark | Light | Use |
|-------|------|-------|-----|
| `gitcortex.aiAccent` | `#8b5cf6` | `#7c3aed` | AI accent (buttons, active states in AI UI) |
| `gitcortex.aiBackground` | `#1e1b4b` | `#ede9fe` | AI panel background |
| `gitcortex.aiAccentDim` | `#8b5cf655` | — | Subtle AI highlight |

## License

MIT.
