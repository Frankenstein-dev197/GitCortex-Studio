import * as vscode from 'vscode';

interface ProjectEntry {
	path: string;
	name: string;
}

/**
 * Tree data provider for the GitCortex "Projects" view.
 * Shows recently opened projects and lets the user open or create new ones.
 */
export class ProjectsViewProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
	private readonly _onDidChange = new vscode.EventEmitter<ProjectTreeItem | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChange.event;

	constructor(private readonly context: vscode.ExtensionContext) {}

	refresh(): void {
		this._onDidChange.fire();
	}

	getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): ProjectTreeItem[] {
		const cfg = vscode.workspace.getConfiguration('gitcortex.projects');
		const recent = cfg.get<string[]>('recent', []) ?? [];
		const folder = vscode.workspace.workspaceFolders?.[0];
		const items: ProjectTreeItem[] = [];

		if (folder) {
			items.push(
				new ProjectTreeItem(
					folder.name,
					vscode.TreeItemCollapsibleState.None,
					'current',
					{
						command: 'gitcortex.projects.open',
						title: 'Open Project',
					},
				),
			);
		}

		for (const p of recent.slice(0, 12)) {
			if (folder && p === folder.uri.fsPath) {
				continue;
			}
			const name = p.split(/[\\/]/).pop() ?? p;
			items.push(new ProjectTreeItem(name, vscode.TreeItemCollapsibleState.None, 'recent', undefined, p));
		}

		if (items.length === 0) {
			items.push(
				new ProjectTreeItem('No recent projects', vscode.TreeItemCollapsibleState.None, 'empty', undefined),
			);
		}

		return items;
	}
}

export class ProjectTreeItem extends vscode.TreeItem {
	constructor(
		label: string,
		collapsible: vscode.TreeItemCollapsibleState,
		context: string,
		command?: vscode.Command,
		fsPath?: string,
	) {
		super(label, collapsible);
		this.contextValue = context;
		if (command) {
			this.command = command;
		}
		if (fsPath) {
			this.tooltip = fsPath;
			this.resourceUri = vscode.Uri.file(fsPath);
		}
		this.iconPath = new vscode.ThemeIcon(context === 'empty' ? 'info' : 'folder-opened');
	}
}
