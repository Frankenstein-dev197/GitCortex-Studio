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
import { AgentOrchestrator } from './orchestrator';
import { GitCortexAIViewProvider } from './chatView';
import type { ToolDefinition, ToolHandler } from './types';

export interface GitCortexAIApi {
	registerTool(tool: ToolDefinition, handler: ToolHandler): vscode.Disposable;
	getTools(): ToolDefinition[];
}

export function activate(context: vscode.ExtensionContext): GitCortexAIApi {
	const autonomy = () =>
		vscode.workspace.getConfiguration('gitcortex.ai').get<'confirm' | 'auto-files' | 'auto-all'>('autonomy', 'confirm');
	const endpoint = () => vscode.workspace.getConfiguration('gitcortex.ai').get<string>('endpoint', '') || undefined;
	const transportId = () =>
		vscode.workspace.getConfiguration('gitcortex.ai').get<'openhands' | 'openai-compatible'>('transport', 'openhands');

	let transport: AgentTransport = transportId() === 'openai-compatible' ? new OpenAICompatibleTransport(endpoint()) : new OpenHandsTransport(endpoint());

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
	);

	// Re-create the transport if the configuration changes.
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration('gitcortex.ai')) {
				transport = transportId() === 'openai-compatible' ? new OpenAICompatibleTransport(endpoint()) : new OpenHandsTransport(endpoint());
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
