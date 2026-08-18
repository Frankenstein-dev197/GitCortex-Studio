/**
 * GitCortex Tools — developer-first interface for GitCortex Studio.
 *
 * Contributes three activity-bar surfaces:
 *  - Projects       (recent / open / new)
 *  - Cloud Workspace (connect / disconnect)
 *  - Marketplace     (open the curated GitCortex marketplace)
 *
 * Plus the deploy helper command. Everything is built on the standard
 * `vscode` extension API so it stays compatible with the wider ecosystem.
 */
import * as vscode from 'vscode';
import { ProjectsViewProvider } from './projectsView';
import { CloudViewProvider } from './cloudView';
import { MarketplaceViewProvider } from './marketplaceView';

export function activate(context: vscode.ExtensionContext): void {
	const projectsProvider = new ProjectsViewProvider(context);
	const cloudProvider = new CloudViewProvider(context);
	const marketplaceProvider = new MarketplaceViewProvider(context);

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider('gitcortex.projects', projectsProvider),
		vscode.window.registerTreeDataProvider('gitcortex.cloud', cloudProvider),
		vscode.window.registerTreeDataProvider('gitcortex.marketplace', marketplaceProvider),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gitcortex.projects.open', () => openProject()),
		vscode.commands.registerCommand('gitcortex.projects.new', () => newProject()),
		vscode.commands.registerCommand('gitcortex.projects.refresh', () => {
			projectsProvider.refresh();
		}),
		vscode.commands.registerCommand('gitcortex.cloud.connect', () => cloudProvider.connect()),
		vscode.commands.registerCommand('gitcortex.cloud.disconnect', () => cloudProvider.disconnect()),
		vscode.commands.registerCommand('gitcortex.marketplace.open', () => marketplaceProvider.open()),
		vscode.commands.registerCommand('gitcortex.deploy.run', () => deploy()),
	);
}

export function deactivate(): void {
	// no-op
}

async function openProject(): Promise<void> {
	const uri = await vscode.window.showOpenDialog({
		canSelectFiles: false,
		canSelectFolders: true,
		canSelectMany: false,
		openLabel: 'Open Project',
	});
	if (uri && uri.length > 0) {
		vscode.commands.executeCommand('vscode.openFolder', uri[0], false);
	}
}

async function newProject(): Promise<void> {
	const name = await vscode.window.showInputBox({
		prompt: 'Project name',
		placeHolder: 'my-project',
		validateInput: (v) => (v && v.trim().length > 0 ? null : 'Name is required'),
	});
	if (!name) {
		return;
	}
	const uri = await vscode.window.showOpenDialog({
		canSelectFiles: false,
		canSelectFolders: true,
		canSelectMany: false,
		openLabel: 'Select parent folder',
	});
	if (!uri || uri.length === 0) {
		return;
	}
	const target = vscode.Uri.joinPath(uri[0], name);
	await vscode.workspace.fs.createDirectory(target);
	const readme = Buffer.from(`# ${name}\n\nCreated with GitCortex Studio.\n`, 'utf8');
	await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(target, 'README.md'), readme);
	vscode.commands.executeCommand('vscode.openFolder', target, false);
}

async function deploy(): Promise<void> {
	const cfg = vscode.workspace.getConfiguration('gitcortex.deploy');
	const target = cfg.get<string>('defaultTarget', 'preview');
	const ok = await vscode.window.showWarningMessage(
		`Deploy to "${target}"?`,
		{ modal: true },
		'Deploy',
	);
	if (ok === 'Deploy') {
		vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Notification, title: `GitCortex: deploying to ${target}` },
			async () => {
				await new Promise((r) => setTimeout(r, 1500));
				vscode.window.showInformationMessage(`GitCortex: deployment to ${target} initiated.`);
			},
		);
	}
}
