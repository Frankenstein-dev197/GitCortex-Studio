/**
 * Webview-based chat UI for GitCortex AI.
 *
 * Renders the conversation and the agent run log (plan/act/observe/reflect
 * timeline), and posts user messages back to the extension host which feeds
 * the orchestrator. Uses the workbench's theming so the AI panel adopts the
 * GitCortex theme, including the `gitcortex.aiAccent` token for AI surfaces.
 */
import * as vscode from 'vscode';
import type { AgentStep } from './types';

export class GitCortexAIViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'gitcortex.ai.chat';
	private view?: vscode.WebviewView;

	constructor(private readonly context: vscode.ExtensionContext) {}

	resolveWebviewView(view: vscode.WebviewView): void {
		this.view = view;
		const wv = view.webview;
		wv.options = { enableScripts: true, localResourceRoots: [this.context.extensionUri] };
		wv.html = this.getHtml(wv);

		wv.onDidReceiveMessage(async (msg) => {
			if (msg.type === 'ready') {
				this.postMessage({ type: 'state', state: 'ready' });
			} else if (msg.type === 'send') {
				vscode.commands.executeCommand('gitcortex.ai.send', msg.text);
			} else if (msg.type === 'clear') {
				vscode.commands.executeCommand('gitcortex.ai.clear');
			}
		});
	}

	show(): void {
		vscode.commands.executeCommand(`${GitCortexAIViewProvider.viewType}.focus`);
	}

	/** Push a new agent step to the run log. */
	appendStep(step: AgentStep): void {
		this.postMessage({ type: 'step', step });
	}

	/** Reset the UI (e.g. on clear). */
	reset(): void {
		this.postMessage({ type: 'reset' });
	}

	private postMessage(msg: unknown): void {
		this.view?.webview.postMessage(msg);
	}

	private getHtml(webview: vscode.Webview): string {
		const nonce = getNonce();
		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GitCortex AI</title>
  <style nonce="${nonce}">
    :root { --ai: var(--vscode-gitcortex-aiAccent, #8b5cf6); --bg: var(--vscode-sideBar-background, transparent); }
    body { margin: 0; padding: 8px; color: var(--vscode-foreground); background: var(--bg); font-family: var(--vscode-font-family); font-size: 13px; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; }
    #log { flex: 1; overflow-y: auto; padding: 4px 4px 12px; }
    .msg { margin: 6px 0; padding: 8px 10px; border-radius: 8px; white-space: pre-wrap; word-break: break-word; }
    .msg.user { background: var(--vscode-input-background); }
    .msg.assistant { background: var(--vscode-gitcortex-aiBackground, color-mix(in srgb, var(--ai) 12%, transparent)); border-left: 3px solid var(--ai); }
    .step { margin: 4px 0; padding: 6px 8px; border-left: 2px solid var(--ai); opacity: 0.92; }
    .step .label { color: var(--ai); font-weight: 600; margin-right: 6px; text-transform: uppercase; font-size: 10px; letter-spacing: .04em; }
    .step .body { color: var(--vscode-descriptionForeground); }
    .step.error { border-color: var(--vscode-errorForeground); }
    .step.error .label { color: var(--vscode-errorForeground); }
    #input-row { display: flex; gap: 6px; padding-top: 6px; border-top: 1px solid var(--vscode-panel-border); }
    textarea { flex: 1; resize: none; height: 40px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 6px; padding: 6px 8px; font: inherit; }
    button { background: var(--ai); color: #fff; border: 0; border-radius: 6px; padding: 0 12px; cursor: pointer; }
    button.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
  </style>
</head>
<body>
  <div id="log"></div>
  <div id="input-row">
    <textarea id="prompt" placeholder="Ask GitCortex AI to build, fix, test, or deploy…"></textarea>
    <button id="send" title="Send">Send</button>
    <button id="clear" class="secondary" title="Clear">Clear</button>
  </div>
  <script nonce="${nonce}">
    const log = document.getElementById('log');
    const prompt = document.getElementById('prompt');
    const vscode = acquireVsCodeApi();
    function add(cls, text) {
      const el = document.createElement('div'); el.className = 'msg ' + cls; el.textContent = text; log.appendChild(el); log.scrollTop = log.scrollHeight;
    }
    function addStep(s) {
      const el = document.createElement('div'); el.className = 'step ' + (s.type === 'error' ? 'error' : '');
      const label = document.createElement('span'); label.className = 'label'; label.textContent = s.type;
      const body = document.createElement('span'); body.className = 'body'; body.textContent = s.summary + (s.detail ? ' — ' + s.detail : '');
      el.appendChild(label); el.appendChild(body); log.appendChild(el); log.scrollTop = log.scrollHeight;
    }
    document.getElementById('send').addEventListener('click', () => {
      const text = prompt.value.trim(); if (!text) return; add('user', text); vscode.postMessage({ type: 'send', text }); prompt.value = '';
    });
    document.getElementById('clear').addEventListener('click', () => { log.innerHTML = ''; vscode.postMessage({ type: 'clear' }); });
    prompt.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('send').click(); } });
    window.addEventListener('message', (e) => {
      const m = e.data;
      if (m.type === 'reset') { log.innerHTML = ''; }
      else if (m.type === 'step') {
        const s = m.step;
        if (s.type === 'message' && s.summary) add(s.role || 'assistant', s.summary); else addStep(s);
      }
    });
    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`;
	}
}

function getNonce(): string {
	const bytes = new Uint8Array(16);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = Math.floor(Math.random() * 256);
	}
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
