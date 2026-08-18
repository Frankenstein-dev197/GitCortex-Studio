/**
 * Built-in GitCortex AI tools: project, files, terminal, tests, deploy.
 *
 * Each tool maps a high-level capability to a concrete action on the workspace
 * via the standard `vscode` API. Destructive tools honor the autonomy setting
 * and request user confirmation when required (see docs/AI_AGENT.md §4).
 */
import * as vscode from 'vscode';
import type { ToolDefinition, ToolResult } from './types';
import { toolRegistry } from './toolRegistry';

type Autonomy = 'confirm' | 'auto-files' | 'auto-all';

function shouldConfirm(toolName: string, autonomy: Autonomy): boolean {
	if (autonomy === 'auto-all') {
		return false;
	}
	if (autonomy === 'auto-files' && toolName.startsWith('file.')) {
		return false;
	}
	return true;
}

async function confirmDestructive(prompt: string): Promise<boolean> {
	const choice = await vscode.window.showWarningMessage(prompt, { modal: true }, 'Allow');
	return choice === 'Allow';
}

export function registerBuiltinTools(getAutonomy: () => Autonomy): void {
	toolRegistry.register(
		{
			name: 'project.open',
			description: 'Open a project folder in GitCortex Studio.',
			parameters: { path: { type: 'string', description: 'Absolute path to the project folder', required: true } },
		},
		async (args) => {
			const p = String(args.path ?? '');
			if (!p) {
				return { ok: false, summary: 'project.open: path required' };
			}
			await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(p), false);
			return { ok: true, summary: `Opened project ${p}` };
		},
	);

	toolRegistry.register(
		{
			name: 'file.read',
			description: 'Read the content of a file in the workspace.',
			parameters: { path: { type: 'string', required: true, description: 'Workspace-relative or absolute file path' } },
		},
		async (args) => {
			const uri = resolveWorkspaceUri(String(args.path ?? ''));
			const bytes = await vscode.workspace.fs.readFile(uri);
			const content = Buffer.from(bytes).toString('utf8');
			return { ok: true, summary: `Read ${uri.fsPath} (${content.length} chars)`, data: { content } };
		},
	);

	toolRegistry.register(
		{
			name: 'file.write',
			description: 'Write content to a file, creating it if needed.',
			parameters: {
				path: { type: 'string', required: true },
				content: { type: 'string', required: true },
			},
		},
		async (args) => {
			const path = String(args.path ?? '');
			const content = String(args.content ?? '');
			if (shouldConfirm('file.write', getAutonomy())) {
				const allow = await confirmDestructive(`GitCortex AI wants to write ${path} (${content.length} chars).`);
				if (!allow) {
					return { ok: false, summary: `Write to ${path} denied by user`, confirmed: false };
				}
			}
			const uri = resolveWorkspaceUri(path);
			await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
			return { ok: true, summary: `Wrote ${uri.fsPath} (${content.length} chars)`, confirmed: true };
		},
	);

	toolRegistry.register(
		{
			name: 'file.search',
			description: 'Search file contents across the workspace.',
			parameters: { query: { type: 'string', required: true } },
		},
		async (args) => {
			const query = String(args.query ?? '');
			// Delegate to the workbench Find In Files; the user sees results in the
			// search panel. The provider API here is fire-and-forget by design.
			vscode.commands.executeCommand('workbench.action.findInFiles', { query });
			return { ok: true, summary: `Triggered workspace search for "${query}"` };
		},
	);

	toolRegistry.register(
		{
			name: 'terminal.run',
			description: 'Run a shell command in the integrated terminal.',
			parameters: { command: { type: 'string', required: true } },
		},
		async (args) => {
			const command = String(args.command ?? '');
			if (shouldConfirm('terminal.run', getAutonomy())) {
				const allow = await confirmDestructive(`GitCortex AI wants to run:\n\n${command}`);
				if (!allow) {
					return { ok: false, summary: 'Terminal command denied by user', confirmed: false };
				}
			}
			const term = vscode.window.createTerminal('GitCortex AI');
			term.show();
			term.sendText(command);
			return { ok: true, summary: `Ran command in terminal: ${command}`, confirmed: true };
		},
	);

	toolRegistry.register(
		{
			name: 'tests.run',
			description: 'Run the test suite (delegates to the workspace test runner).',
			parameters: { selector: { type: 'string', description: 'Optional test selector' } },
		},
		async (args) => {
			const selector = args.selector ? String(args.selector) : undefined;
			const term = vscode.window.createTerminal('GitCortex AI · tests');
			term.show();
			term.sendText(selector ? `yarn test ${selector}` : 'yarn test');
			vscode.commands.executeCommand('workbench.view.testing');
			return { ok: true, summary: `Triggered test run${selector ? ` for ${selector}` : ''}` };
		},
	);

	toolRegistry.register(
		{
			name: 'deploy.run',
			description: 'Trigger a deployment flow.',
			parameters: { target: { type: 'string', description: 'Deploy target: preview | staging | production' } },
		},
		async (args) => {
			const target = String(args.target ?? 'preview');
			if (shouldConfirm('deploy.run', getAutonomy())) {
				const allow = await confirmDestructive(`GitCortex AI wants to deploy to "${target}".`);
				if (!allow) {
					return { ok: false, summary: 'Deploy denied by user', confirmed: false };
				}
			}
			vscode.commands.executeCommand('gitcortex.deploy.run');
			return { ok: true, summary: `Initiated deploy to ${target}`, confirmed: true };
		},
	);
}

function resolveWorkspaceUri(path: string): vscode.Uri {
	if (path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path)) {
		return vscode.Uri.file(path);
	}
	const root = vscode.workspace.workspaceFolders?.[0]?.uri;
	if (!root) {
		return vscode.Uri.file(path);
	}
	return vscode.Uri.joinPath(root, path);
}
