/**
 * Apply focused branding patches from patches/ to the code-oss/ tree.
 *
 * The code-oss/ tree is kept pristine (close to upstream) so that upstream syncs
 * are clean rebases. Branding (product name, default theme, splash references,
 * window title, welcome strings) is applied here at build time, expressed as a
 * list of declarative string replacements over specific upstream files.
 *
 * Run via: yarn gitcortex:brand
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const CODE_OSS = path.join(ROOT, 'code-oss');
const PATCHES = path.join(ROOT, 'patches');

interface Patch {
	file: string;
	replacements: { from: string; to: string }[];
}

// Identity patches for product.json — the primary branding seam.
const PRODUCT_PATCHES: Patch[] = [
	{
		file: 'product.json',
		replacements: [
			{ from: '"nameShort": "Code - OSS"', to: '"nameShort": "GitCortex"' },
			{ from: '"nameLong": "Code - OSS"', to: '"nameLong": "GitCortex Studio"' },
			{ from: '"applicationName": "code-oss"', to: '"applicationName": "gitcortex-studio"' },
			{ from: '"dataFolderName": ".vscode-oss"', to: '"dataFolderName": "GitCortexStudio"' },
			{ from: '"sharedDataFolderName": ".vscode-oss-shared"', to: '"sharedDataFolderName": "GitCortexStudio-Shared"' },
			{ from: '"serverApplicationName": "code-server-oss"', to: '"serverApplicationName": "gitcortex-server"' },
			{ from: '"serverDataFolderName": ".vscode-server-oss"', to: '"serverDataFolderName": ".gitcortex-server"' },
			{ from: '"tunnelApplicationName": "code-tunnel-oss"', to: '"tunnelApplicationName": "gitcortex-tunnel"' },
			{ from: '"win32DirName": "Microsoft Code OSS"', to: '"win32DirName": "GitCortex Studio"' },
			{ from: '"win32NameVersion": "Microsoft Code OSS"', to: '"win32NameVersion": "GitCortex Studio"' },
			{ from: '"win32RegValueName": "CodeOSS"', to: '"win32RegValueName": "GitCortexStudio"' },
			{ from: '"win32AppUserModelId": "Microsoft.CodeOSS"', to: '"win32AppUserModelId": "studio.gitcortex"' },
			{ from: '"win32ShellNameShort": "C&ode - OSS"', to: '"win32ShellNameShort": "G&itCortex Studio"' },
			{ from: '"linuxIconName": "code-oss"', to: '"linuxIconName": "gitcortex-studio"' },
			{ from: '"darwinBundleIdentifier": "com.visualstudio.code.oss"', to: '"darwinBundleIdentifier": "studio.gitcortex"'},
			{ from: '"darwinApplicationName": "Visual Studio Code - OSS"', to: '"darwinApplicationName": "GitCortex Studio"' },
			{ from: '"urlProtocol": "code-oss"', to: '"urlProtocol": "gitcortex"' },
			{ from: '"win32MutexName": "vscodeoss"', to: '"win32MutexName": "gitcortexstudiostable"' },
			{ from: '"win32TunnelServiceMutex": "vscodeoss-tunnelservice"', to: '"win32TunnelServiceMutex": "gitcortex-tunnelservice"' },
			{ from: '"win32TunnelMutex": "vscodeoss-tunnel"', to: '"win32TunnelMutex": "gitcortex-tunnel"' },
			{ from: '"agentsTelemetryAppName": "agents"', to: '"agentsTelemetryAppName": "gitcortex"' },
		],
	},
	{
		// Rebrand the npm package identity (used in About, telemetry, version probes).
		file: 'package.json',
		replacements: [
			{ from: '"name": "code-oss-dev"', to: '"name": "gitcortex-studio-dev"' },
		],
	},
];

// User-facing string patches applied across the engine tree. These target the
// specific source files that surface "Visual Studio Code"/"Code - OSS" to the
// end user (welcome, onboarding, walkthrough, server CLI). Test files and pure
// code comments are intentionally left alone — they never reach the user.
const STRING_PATCHES: Patch[] = [
	{
		file: 'src/vs/workbench/contrib/welcomeOnboarding/browser/onboardingVariationA.ts',
		replacements: [
			{ from: 'Welcome to Visual Studio Code', to: 'Welcome to GitCortex Studio' },
		],
	},
	{
		file: 'src/vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough.ts',
		replacements: [
			{ from: 'Visual Studio Code comes with the powerful IntelliSense', to: 'GitCortex Studio comes with the powerful IntelliSense' },
			{ from: 'editing features in Visual Studio Code.', to: 'editing features in GitCortex Studio.' },
		],
	},
	{
		file: 'src/vs/server/node/server.cli.ts',
		replacements: [
			{ from: 'inside a Visual Studio Code terminal.', to: 'inside a GitCortex Studio terminal.' },
		],
	},
];

function applyPatch(patch: Patch): { file: string; applied: number; skipped: number } {
	const fullPath = path.join(CODE_OSS, patch.file);
	if (!fs.existsSync(fullPath)) {
		// Not all upstream files exist at every snapshot; skip silently but report.
		return { file: patch.file, applied: 0, skipped: patch.replacements.length };
	}
	let content = fs.readFileSync(fullPath, 'utf8');
	let applied = 0;
	let skipped = 0;
	for (const r of patch.replacements) {
		if (content.includes(r.from)) {
			content = content.split(r.from).join(r.to);
			applied++;
		} else {
			skipped++;
		}
	}
	fs.writeFileSync(fullPath, content, 'utf8');
	return { file: patch.file, applied, skipped };
}

// Structured JSON merges into product.json. Used for fields that don't exist
// upstream (so string-replace can't add them) — e.g. extensionsGallery
// (Open VSX marketplace) and onboardingThemes additions. Idempotent: a second
// run is a no-op because the target value is detected and not re-added.
interface JsonMerge {
	/** Dot path into product.json, e.g. "extensionsGallery" or "a.b". */
	path: string;
	value: unknown;
	/** When true, `value` is an array merged into an existing array (deduped). */
	mergeArray?: boolean;
}

const PRODUCT_JSON_MERGES: JsonMerge[] = [
	{
		// Enable the built-in Extensions view by pointing the gallery at Open VSX.
		// Open VSX is the open-source marketplace used by VSCodium/Code-OSS forks;
		// it serves the same VSIX format so existing extensions keep working.
		path: 'extensionsGallery',
		value: {
			serviceUrl: 'https://open-vsx.org/vscode/gallery',
			itemUrl: 'https://open-vsx.org/vscode/item',
			resourceUrlTemplate: 'https://open-vsx.org/vscode/unpkg/{publisher}/{name}/{version}/{path}',
			publisherUrl: 'https://open-vsx.org/vscode/publisher/{publisher}',
			extensionUrlTemplate: 'https://open-vsx.org/vscode/asset/{publisher}/{name}/{version}/Microsoft.VisualStudio.Code.Manifest.VSIXManifest',
		},
	},
	{
		// Surface the GitCortex themes in the first-run onboarding theme picker.
		path: 'onboardingThemes',
		mergeArray: true,
		value: [
			{ id: 'gitcortex-dark', label: 'GitCortex Dark', themeId: 'GitCortex Dark', type: 'dark' },
			{ id: 'gitcortex-light', label: 'GitCortex Light', themeId: 'GitCortex Light', type: 'light' },
		],
	},
];

function applyJsonMerge(file: string, merge: JsonMerge): { file: string; path: string; status: 'inserted' | 'merged' | 'skipped' } {
	const fullPath = path.join(CODE_OSS, file);
	if (!fs.existsSync(fullPath)) {
		return { file, path: merge.path, status: 'skipped' };
	}
	const obj = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as Record<string, unknown>;
	const segs = merge.path.split('.');
	let cursor = obj;
	for (let i = 0; i < segs.length - 1; i++) {
		if (cursor[segs[i]] === undefined) {
			cursor[segs[i]] = {} as Record<string, unknown>;
		}
		cursor = cursor[segs[i]] as Record<string, unknown>;
	}
	const leaf = segs[segs.length - 1];
	const existing = cursor[leaf];
	if (existing === undefined) {
		cursor[leaf] = merge.value;
		fs.writeFileSync(fullPath, JSON.stringify(obj, undefined, '\t') + '\n', 'utf8');
		return { file, path: merge.path, status: 'inserted' };
	}
	if (merge.mergeArray && Array.isArray(existing) && Array.isArray(merge.value)) {
		const newArr = [...existing];
		const keyOf = (v: unknown) => JSON.stringify(v);
		for (const item of merge.value as unknown[]) {
			if (!newArr.some((e) => keyOf(e) === keyOf(item))) {
				newArr.push(item);
			}
		}
		if (newArr.length !== (existing as unknown[]).length) {
			cursor[leaf] = newArr;
			fs.writeFileSync(fullPath, JSON.stringify(obj, undefined, '\t') + '\n', 'utf8');
			return { file, path: merge.path, status: 'merged' };
		}
		return { file, path: merge.path, status: 'skipped' };
	}
	return { file, path: merge.path, status: 'skipped' };
}

function main(): void {
	if (!fs.existsSync(CODE_OSS)) {
		console.error(`[gitcortex:brand] code-oss/ not found at ${CODE_OSS}`);
		console.error('                 Run `./build/gitcortex/import-upstream.sh <tag>` first.');
		process.exit(1);
	}
	let totalApplied = 0;
	let totalSkipped = 0;

	console.log('[gitcortex:brand] Applying identity patches (product.json, package.json) ...');
	for (const patch of PRODUCT_PATCHES) {
		const res = applyPatch(patch);
		totalApplied += res.applied;
		totalSkipped += res.skipped;
		console.log(`  ${res.file.padEnd(28)} applied=${res.applied} skipped=${res.skipped}`);
	}

	console.log('[gitcortex:brand] Applying user-facing string patches ...');
	for (const patch of STRING_PATCHES) {
		const res = applyPatch(patch);
		totalApplied += res.applied;
		totalSkipped += res.skipped;
		console.log(`  ${res.file.padEnd(60)} applied=${res.applied} skipped=${res.skipped}`);
	}

	console.log('[gitcortex:brand] Applying product.json JSON merges (Open VSX gallery, onboarding themes) ...');
	for (const merge of PRODUCT_JSON_MERGES) {
		const res = applyJsonMerge('product.json', merge);
		console.log(`  product.json :: ${res.path.padEnd(20)} ${res.status}`);
		if (res.status !== 'skipped') {
			totalApplied++;
		}
	}

	console.log(`[gitcortex:brand] Done. ${totalApplied} replacement(s) applied, ${totalSkipped} not found (ok if upstream changed).`);
}

main();
