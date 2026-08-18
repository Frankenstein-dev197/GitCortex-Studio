/**
 * GitCortex AI — extension entry point.
 *
 * Wires together the agent orchestrator, the built-in tools, the pluggable
 * transport, and the chat webview. Exposes a public `gitcortex.ai` API so
 * other extensions can register custom tools and transports.
 *
 * Architecture: docs/AI_AGENT.md — User → AI → Project → Files → Terminal → Tests → Deploy.
 */
import * as vscode from 'vscode';
import { toolRegistry } from './toolRegistry';
import { registerBuiltinTools } from './tools';
import { OpenHandsTransport, OpenAICompatibleTransport, type AgentTransport } from './transport';
import { AhpTransport } from './transport.ahp';
import { AgentOrchestrator } from './orchestrator';
import { GitCortexAIViewProvider } from './chatView';
import type { ToolDefinition, ToolHandler } from './types';

export interface GitCortexAIApi {
	registerTool(tool: ToolDefinition, handler: ToolHandler): vscode.Disposable;
	getTools(): ToolDefinition[];
}

/** Returns the active editor's selection text + relative file path, or undefined. */
function activeSelectionText(): { text: string; file: string } | undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.selection.isEmpty) {
		return undefined;
	}
	return {
		text: editor.document.getText(editor.selection),
		file: vscode.workspace.asRelativePath(editor.document.uri),
	};
}

/** Build a transport by id; AHP is native, others fall back to remote runtimes. */
function buildTransport(id: 'ahp' | 'openhands' | 'openai-compatible', endpoint: string | undefined): AgentTransport {
	const remote = id === 'openai-compatible' ? new OpenAICompatibleTransport(endpoint) : new OpenHandsTransport(endpoint);
	if (id === 'ahp') {
		return new AhpTransport(remote);
	}
	return remote;
}

export function activate(context: vscode.ExtensionContext): GitCortexAIApi {
	const autonomy = () =>
		vscode.workspace.getConfiguration('gitcortex.ai').get<'confirm' | 'auto-files' | 'auto-all'>('autonomy', 'confirm');
	const endpoint = () => vscode.workspace.getConfiguration('gitcortex.ai').get<string>('endpoint', '') || undefined;
	const transportId = () =>
		vscode.workspace.getConfiguration('gitcortex.ai').get<'ahp' | 'openhands' | 'openai-compatible'>('transport', 'ahp');

	let transport: AgentTransport = buildTransport(transportId(), endpoint());

	registerBuiltinTools(autonomy);

	const provider = new GitCortexAIViewProvider(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(GitCortexAIViewProvider.viewType, provider));

	const orchestrator = new AgentOrchestrator(transport, autonomy, {
		onStep: (step) => provider.appendStep(step),
	});

	context.subscriptions.push(
		vscode.commands.registerCommand('gitcortex.ai.open', () => provider.show()),
		vscode.commands.registerCommand('gitcortex.ai.send', async (text?: string) => {
			provider.show();
			const prompt = typeof text === 'string' ? text : await vscode.window.showInputBox({ prompt: 'GitCortex AI', placeHolder: 'Ask anything…' });
			if (prompt) {
				await orchestrator.run(prompt);
			}
		}),
		vscode.commands.registerCommand('gitcortex.ai.clear', () => {
			orchestrator.clear();
			provider.reset();
		}),
		vscode.commands.registerCommand('gitcortex.ai.runFile', async (uri: vscode.Uri) => {
			const editor = vscode.window.activeTextEditor;
			const fileUri = uri ?? editor?.document.uri;
			if (!fileUri) {
				vscode.window.showWarningMessage('GitCortex AI: no file to run on.');
				return;
			}
			const rel = vscode.workspace.asRelativePath(fileUri);
			provider.show();
			await orchestrator.run(`Review and work on the current file: ${rel}`);
		}),
		vscode.commands.registerCommand('gitcortex.ai.explainSelection', async () => {
			const selection = activeSelectionText();
			if (!selection) {
				vscode.window.showInformationMessage('GitCortex AI: select some code first.');
				return;
			}
			provider.show();
			await orchestrator.run(`Explain the following code. Summarize what it does, its inputs/outputs, and any caveats:\n\n\`\`\`\n${selection.text}\n\`\`\`\n(file: ${selection.file})`);
		}),
		vscode.commands.registerCommand('gitcortex.ai.refactorSelection', async () => {
			const selection = activeSelectionText();
			if (!selection) {
				vscode.window.showInformationMessage('GitCortex AI: select some code first.');
				return;
			}
			provider.show();
			await orchestrator.run(`Refactor the following code for readability and maintainability without changing behavior, then apply the changes to ${selection.file}:\n\n\`\`\`\n${selection.text}\n\`\`\``);
		}),
		vscode.commands.registerCommand('gitcortex.ai.generateFromComment', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}
			const line = editor.document.lineAt(editor.selection.active.line).text.trim();
			if (!line) {
				vscode.window.showInformationMessage('GitCortex AI: place the cursor on a comment line.');
				return;
			}
			const rel = vscode.workspace.asRelativePath(editor.document.uri);
			const lang = editor.document.languageId;
			provider.show();
			await orchestrator.run(`Generate code implementing this comment, in language ${lang}, and write it to ${rel} below the comment:\n\n${line}`);
		}),
		vscode.commands.registerCommand('gitcortex.ai.fixProblems', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}
			const rel = vscode.workspace.asRelativePath(editor.document.uri);
			const diags = vscode.languages.getDiagnostics(editor.document.uri);
			const summary = diags.slice(0, 25).map((d) => `L${d.range.start.line + 1}:${d.range.start.character + 1} [${d.source ?? 'diag'}] ${d.message}`).join('\n');
			provider.show();
			await orchestrator.run(`Fix the following problems in ${rel} and apply the changes:\n${summary || '(no diagnostics reported — review the file for issues)'}`);
		}),
		vscode.commands.registerCommand('gitcortex.ai.runTests', async () => {
			provider.show();
			await orchestrator.run('Run the test suite for this project and report the results.');
		}),
	);

	// Re-create the transport if the configuration changes.
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration('gitcortex.ai')) {
				transport = buildTransport(transportId(), endpoint());
			}
		}),
	);

	const api: GitCortexAIApi = {
		registerTool: (tool: ToolDefinition, handler: ToolHandler) => {
			const entry = toolRegistry.register(tool, handler);
			return new vscode.Disposable(() => entry.dispose());
		},
		getTools: () => toolRegistry.all(),
	};

	return api;
}

export function deactivate(): void {
	// no-op
}
