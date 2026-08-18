# GitCortex AI

The built-in AI agent for **GitCortex Studio**. GitCortex AI turns the editor into an AI-driven development environment that can plan, edit files, run terminal commands, run tests, and deploy.

## Pipeline

```
User → GitCortex AI (orchestrator) → Project → Files → Terminal → Tests → Deploy
```

See the full design in [`docs/AI_AGENT.md`](../../docs/AI_AGENT.md).

## Features

- **Agent orchestrator** with a plan → act → observe → reflect loop.
- **Built-in tools**: `project.open`, `file.read`, `file.write`, `file.search`, `terminal.run`, `tests.run`, `deploy.run`.
- **Pluggable transport**: default `openhands` (OpenHands-compatible agent runtime) or `openai-compatible`.
- **Safety model**: destructive tools (`file.write`, `terminal.run`, `deploy.run`) require user confirmation by default (configurable via `gitcortex.ai.autonomy`).
- **Chat UI**: a webview panel in the activity bar showing the conversation and the agent run log.

## Settings

| Setting | Default | Description |
|--------|---------|-------------|
| `gitcortex.ai.transport` | `openhands` | The agent transport. |
| `gitcortex.ai.endpoint` | `""` | Endpoint URL for the transport (e.g. an OpenHands runtime). |
| `gitcortex.ai.autonomy` | `confirm` | Autonomy level for destructive tools. |

## Public API for other extensions

Register a custom tool so the agent can call it:

```ts
import type * as vscode from 'vscode';

export function activate(ctx: vscode.ExtensionContext) {
  const ai = vscode.extensions.getExtension('gitcortex.gitcortex-ai')?.exports;
  ai?.registerTool(
    {
      name: 'mytool.do',
      description: 'Does the thing',
      parameters: { value: { type: 'string', description: 'The value' } },
    },
    async (args) => ({ ok: true, summary: `did: ${args.value}` }),
  );
}
```

## Relation to the engine's Agent Host

The Code-OSS engine already ships a local Agent Host Protocol (AHP) runtime with an orchestrator and Codex/Claude/Copilot harnesses (see `docs/CODE-OSS-ANALYSIS.md` §6). GitCortex AI is designed to migrate onto that native seam: the orchestrator here mirrors the AHP chat-surface shape, and the `openhands` transport can be retargeted to the engine's discoverable local AHP endpoint.

## License

MIT.
