/*---------------------------------------------------------------------------------------------
 *  Copyright (c) GitCortex Studio. All rights reserved.
 *  Licensed under the MIT License.
 *
 *  GitCortex contribution: registers a real Activity Bar view container and
 *  Command Palette commands. The AI backend is wired through the honest
 *  IGitCortexAgentService — commands never fake agent results.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from '../../../../platform/registry/common/platform.js';
import { IViewContainersRegistry, ViewContainerLocation, Extensions as ViewContainerExtensions, IViewsRegistry } from '../../../common/views.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { localize2, localize } from '../../../../nls.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { registerAction2, Action2, MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IGitCortexAgentService } from '../common/gitcortex.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { Severity } from '../../../../platform/notification/common/notification.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';

export const GITCORTEX_VIEW_CONTAINER_ID = 'workbench.view.gitcortex';
export const GITCORTEX_VIEW_ID = 'gitcortexAgentView';

// --- View container registration (Activity Bar) -----------------------------

const viewContainerTitle = localize2('gitcortex.viewContainer', "GitCortex");

const viewContainer = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
	id: GITCORTEX_VIEW_CONTAINER_ID,
	title: viewContainerTitle,
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [GITCORTEX_VIEW_CONTAINER_ID]),
	icon: Codicon.hubot,
	storageId: GITCORTEX_VIEW_CONTAINER_ID,
	hideIfEmpty: false,
}, ViewContainerLocation.Sidebar, { doNotRegisterOpenCommand: false });

// Empty view list for now; a real view pane will be added as the backend matures.
Registry.as<IViewsRegistry>(ViewContainerExtensions.ViewsRegistry).registerViews([], viewContainer);

// --- Commands (honest: reflect real backend connection status) --------------

const gitcortexCategory = localize2('gitcortex.category', "GitCortex");

class GitCortexRunAgentAction extends Action2 {
	constructor() {
		super({
			id: 'gitcortex.runAgent',
			title: localize2('gitcortex.runAgent', "GitCortex: Run Agent"),
			category: gitcortexCategory,
			f1: true,
		});
	}

	override async run(accessor: ServicesAccessor): Promise<void> {
		const agentService = accessor.get(IGitCortexAgentService);
		const notificationService = accessor.get(INotificationService);
		const workspaceContextService = accessor.get(IWorkspaceContextService);

		if (!agentService.isBackendConnected) {
			// Honest: no backend registered. Do not fabricate a run.
			notificationService.notify({
				severity: Severity.Warning,
				message: localize('gitcortex.noBackend', "GitCortex AI backend is not connected. No agent was run. Register a backend (e.g. the OpenHands adapter) to enable this command."),
			});
			return;
		}

		const root = workspaceContextService.getWorkspace().folders[0]?.uri.fsPath ?? '';
		const result = await agentService.run({ prompt: '', workspaceRoot: root });
		if (!result.connected) {
			notificationService.notify({
				severity: Severity.Warning,
				message: localize('gitcortex.runFailed', "GitCortex agent did not run: {0}", result.error ?? 'unknown reason'),
			});
		}
	}
}

class GitCortexShowStatusAction extends Action2 {
	constructor() {
		super({
			id: 'gitcortex.showStatus',
			title: localize2('gitcortex.showStatus', "GitCortex: Show AI Status"),
			category: gitcortexCategory,
			f1: true,
		});
	}

	override run(accessor: ServicesAccessor): void {
		const agentService = accessor.get(IGitCortexAgentService);
		const notificationService = accessor.get(INotificationService);
		const connected = agentService.isBackendConnected;
		notificationService.info(
			connected
				? localize('gitcortex.statusConnected', "GitCortex AI: backend connected.")
				: localize('gitcortex.statusDisconnected', "GitCortex AI: no backend connected (foundation only).")
		);
	}
}

registerAction2(GitCortexRunAgentAction);
registerAction2(GitCortexShowStatusAction);

// Surface the view container in the View menu.
MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
	command: {
		id: `${GITCORTEX_VIEW_CONTAINER_ID}.focus`,
		title: viewContainerTitle,
	},
	order: 60,
});
