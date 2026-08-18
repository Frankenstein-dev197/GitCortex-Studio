/**
 * GitCortex Marketplace — extension entry point.
 *
 * Provides a curated entry surface into extension discovery, backed by the
 * engine's built-in Extensions view (configured to Open VSX via product.json).
 * The commands delegate to the engine's own marketplace commands so the
 * browsing/install UX stays the familiar VS Code one — no UI reinvention.
 */
import * as vscode from 'vscode';

/** First-party extensions surfaced as quick installs in the welcome view. */
const FIRST_PARTY: Record<string, { id: string; label: string }> = {
	ai: { id: 'gitcortex.gitcortex-ai', label: 'GitCortex AI' },
	tools: { id: 'gitcortex.gitcortex-tools', label: 'GitCortex Tools' },
	theme: { id: 'gitcortex.gitcortex-theme', label: 'GitCortex Theme' },
};

export function activate(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		// Open the engine's built-in Extensions view with a search filter.
		vscode.commands.registerCommand('gitcortex.marketplace.browse', async () => {
			await vscode.commands.executeCommand('workbench.view.extensions');
			await vscode.commands.executeCommand('workbench.extensions.search', '');
		}),
		vscode.commands.registerCommand('gitcortex.marketplace.installAi', () => install(FIRST_PARTY.ai.id, FIRST_PARTY.ai.label)),
		vscode.commands.registerCommand('gitcortex.marketplace.installTools', () => install(FIRST_PARTY.tools.id, FIRST_PARTY.tools.label)),
		vscode.commands.registerCommand('gitcortex.marketplace.installTheme', () => install(FIRST_PARTY.theme.id, FIRST_PARTY.theme.label)),
	);
}

/** Install (or open) an extension by marketplace id, surfacing a status message. */
async function install(extensionId: string, label: string): Promise<void> {
	// Built-in extensions are already present, so "search" lands the user on the
	// extension's detail page in the engine Extensions view.
	await vscode.commands.executeCommand('workbench.view.extensions');
	await vscode.commands.executeCommand('workbench.extensions.search', `@id:${extensionId}`);
	vscode.window.showInformationMessage(`GitCortex Marketplace: opened ${label} (${extensionId}).`);
}

export function deactivate(): void {
	// no-op
}
