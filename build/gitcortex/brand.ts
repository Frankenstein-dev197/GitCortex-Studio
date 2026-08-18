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

// Declarative branding patches. Each targets a specific upstream file and
// performs exact string replacements. Kept minimal and auditable.
const PATCHES_TO_APPLY: Patch[] = [
	{
		file: 'product.json',
		replacements: [
			{ from: '"nameShort": "Code - OSS"', to: '"nameShort": "GitCortex"' },
			{ from: '"nameLong": "Code - OSS"', to: '"nameLong": "GitCortex Studio"' },
			{ from: '"applicationName": "code-oss"', to: '"applicationName": "gitcortex-studio"' },
			{ from: '"dataFolderName": ".vscode-oss"', to: '"dataFolderName": "GitCortexStudio"' },
			{ from: '"sharedDataFolderName": ".vscode-oss-shared"', to: '"sharedDataFolderName": "GitCortexStudio-Shared"' },
			{ from: '"serverApplicationName": "code-server-oss"', to: '"serverApplicationName": "gitcortex-server"' },
			{ from: '"tunnelApplicationName": "code-tunnel-oss"', to: '"tunnelApplicationName": "gitcortex-tunnel"' },
			{ from: '"win32DirName": "Microsoft Code OSS"', to: '"win32DirName": "GitCortex Studio"' },
			{ from: '"win32NameVersion": "Microsoft Code OSS"', to: '"win32NameVersion": "GitCortex Studio"' },
			{ from: '"win32RegValueName": "CodeOSS"', to: '"win32RegValueName": "GitCortexStudio"' },
			{ from: '"win32AppUserModelId": "Microsoft.CodeOSS"', to: '"win32AppUserModelId": "studio.gitcortex"' },
			{ from: '"linuxIconName": "code-oss"', to: '"linuxIconName": "gitcortex-studio"' },
			{ from: '"darwinBundleIdentifier": "com.visualstudio.code.oss"', to: '"darwinBundleIdentifier": "studio.gitcortex"' },
			{ from: '"urlProtocol": "code-oss"', to: '"urlProtocol": "gitcortex"' },
			{ from: '"win32MutexName": "vscodeoss"', to: '"win32MutexName": "gitcortexstudiostable"' },
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

function main(): void {
	if (!fs.existsSync(CODE_OSS)) {
		console.error(`[gitcortex:brand] code-oss/ not found at ${CODE_OSS}`);
		console.error('                 Run `./build/gitcortex/import-upstream.sh <tag>` first.');
		process.exit(1);
	}
	console.log('[gitcortex:brand] Applying branding patches to code-oss/ ...');
	let totalApplied = 0;
	let totalSkipped = 0;
	for (const patch of PATCHES_TO_APPLY) {
		const res = applyPatch(patch);
		totalApplied += res.applied;
		totalSkipped += res.skipped;
		console.log(`  ${res.file.padEnd(28)} applied=${res.applied} skipped=${res.skipped}`);
	}
	console.log(`[gitcortex:brand] Done. ${totalApplied} replacement(s) applied, ${totalSkipped} not found (ok if upstream changed).`);
}

main();
