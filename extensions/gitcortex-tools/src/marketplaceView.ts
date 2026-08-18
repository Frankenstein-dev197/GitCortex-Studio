import * as vscode from 'vscode';

/**
 * Tree data provider for the GitCortex "Marketplace" view.
 * Shows curated entry points into the GitCortex extension marketplace.
 */
export class MarketplaceViewProvider implements vscode.TreeDataProvider<MarketplaceTreeItem> {
	private readonly _onDidChange = new vscode.EventEmitter<MarketplaceTreeItem | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChange.event;

	constructor(_context?: vscode.ExtensionContext) {}

	refresh(): void {
		this._onDidChange.fire();
	}

	getTreeItem(element: MarketplaceTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): MarketplaceTreeItem[] {
		return [
			new MarketplaceTreeItem('Browse extensions', 'browse', 'extensions', 'gitcortex.marketplace.open'),
			new MarketplaceTreeItem('AI agents', 'agents', 'hubot', 'gitcortex.marketplace.open'),
			new MarketplaceTreeItem('Themes', 'themes', 'symbol-color', 'gitcortex.marketplace.open'),
			new MarketplaceTreeItem('Language packs', 'langpacks', 'globe', 'gitcortex.marketplace.open'),
		];
	}

	open(): void {
		vscode.commands.executeCommand('workbench.view.extensions');
		vscode.window.showInformationMessage('GitCortex: opening extension marketplace.');
	}
}

export class MarketplaceTreeItem extends vscode.TreeItem {
	constructor(label: string, context: string, icon: string, commandId?: string) {
		super(label, vscode.TreeItemCollapsibleState.None);
		this.contextValue = context;
		this.iconPath = new vscode.ThemeIcon(icon);
		if (commandId) {
			this.command = { command: commandId, title: label };
		}
	}
}
