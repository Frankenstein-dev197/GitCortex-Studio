import * as vscode from 'vscode';

/**
 * Tree data provider for the GitCortex "Cloud Workspace" view.
 * Represents the connection state to a remote, agent-ready cloud workspace.
 */
export class CloudViewProvider implements vscode.TreeDataProvider<CloudTreeItem> {
	private readonly _onDidChange = new vscode.EventEmitter<CloudTreeItem | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChange.event;
	private connected = false;

	constructor(_context?: vscode.ExtensionContext) {}

	refresh(): void {
		this._onDidChange.fire();
	}

	getTreeItem(element: CloudTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): CloudTreeItem[] {
		if (!this.connected) {
			return [new CloudTreeItem('Not connected', 'disconnected', 'cloud-off')];
		}
		const endpoint = vscode.workspace.getConfiguration('gitcortex.cloud').get<string>('endpoint', '');
		return [
			new CloudTreeItem('Workspace: connected', 'connected', 'cloud'),
			new CloudTreeItem(`Endpoint: ${endpoint || 'default'}`, 'endpoint', 'server'),
			new CloudTreeItem('Runtime: ready for agents', 'runtime', 'rocket'),
		];
	}

	async connect(): Promise<void> {
		const endpoint = await vscode.window.showInputBox({
			prompt: 'Cloud workspace endpoint URL',
			placeHolder: 'https://cloud.gitcortex.studio',
		});
		if (endpoint === undefined) {
			return;
		}
		await vscode.workspace.getConfiguration('gitcortex.cloud').update('endpoint', endpoint, vscode.ConfigurationTarget.Global);
		this.connected = true;
		this.refresh();
		vscode.window.showInformationMessage('GitCortex: cloud workspace connected.');
	}

	disconnect(): void {
		this.connected = false;
		this.refresh();
		vscode.window.showInformationMessage('GitCortex: cloud workspace disconnected.');
	}
}

export class CloudTreeItem extends vscode.TreeItem {
	constructor(label: string, context: string, icon: string) {
		super(label, vscode.TreeItemCollapsibleState.None);
		this.contextValue = context;
		this.iconPath = new vscode.ThemeIcon(icon);
	}
}
