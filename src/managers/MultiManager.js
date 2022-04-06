//--------------------------------------------------------
//-- Multi
//--------------------------------------------------------
import { createRequire } from "node:module";
import path from "node:path";
import chalk from "chalk";
import fss from "@absolunet/fss";
import __ from "@absolunet/private-registry";
import { terminal } from "@absolunet/terminal";
import builder from "../helpers/builder.js";
import documenter from "../helpers/documenter.js";
import fixer from "../helpers/fixer.js";
import paths from "../helpers/paths.js";
import util from "../helpers/util.js";
import AbstractManager from "./AbstractManager.js";

/**
 * Multi package manager.
 *
 * @augments AbstractManager
 */
class MultiManager extends AbstractManager {
	/**
	 * Create a multi package manager.
	 *
	 * @inheritdoc
	 */
	constructor(options) {
		super(options);

		// Resolve local Lerna binary
		const require = createRequire(import.meta.url);
		__(this).set("lerna-binary", `${path.dirname(require.resolve("lerna"))}/cli.js`);

		// Get a list of all subpackages from Lerna
		const rawList = JSON.parse(terminal.process.runAndRead(`${this.lernaBinary} list --all --json`));

		const subpackagesList = rawList.map(({ location }) => {
			const root = util.relativizePath(location);

			return {
				root,
				source: `${root}/${paths.subpackage.sources}`,
				destination: `${root}/${paths.subpackage.distributions}`,
				name: path.basename(location),
			};
		});

		__(this).set("subpackages", subpackagesList);
	}

	/**
	 * @inheritdoc
	 */
	get version() {
		const file = `${paths.package.root}/package.json`;

		if (fss.exists(file)) {
			const { version } = fss.readJson(file);

			return version;
		}

		return null;
	}

	/**
	 * List of repository's subpackages.
	 *
	 * @type {Array<{root: string, source: string, destination: string, name: string}>}
	 */
	get subpackages() {
		return __(this).get("subpackages");
	}

	/**
	 * Lerna binary.
	 *
	 * @type {string}
	 */
	get lernaBinary() {
		return `node ${__(this).get("lerna-binary")}`;
	}

	/**
	 * Execute async code within each subpackage.
	 *
	 * @async
	 * @param {Function} [toExecute] - Async function to execute.
	 * @returns {Promise} When all code is executed.
	 */
	async forEachSubpackage(toExecute) {
		for (const subpackage of this.subpackages) {
			await toExecute(subpackage);
		}
	}

	/**
	 * @inheritdoc
	 */
	outdated(options) {
		return super.outdated(options, async () => {
			// Check outdated dependencies for all subpackages
			await this.forEachSubpackage(async ({ root }) => {
				await util.npmOutdated(root);
			});
		});
	}

	/**
	 * @inheritdoc
	 */
	build(options) {
		return super.build(options, async () => {
			// Run builder for all subpackages
			await builder.run(__(this).get("dist"), this.subpackages);
		});
	}

	/**
	 * @inheritdoc
	 */
	watch(options) {
		return super.watch(options, async () => {
			// Run watcher for all subpackages
			await builder.watch(__(this).get("dist"), this.subpackages);
		});
	}

	/**
	 * @inheritdoc
	 */
	fix(options) {
		return super.fix(options, async () => {
			// Run fixer
			await fixer.run();
		});
	}

	/**
	 * @inheritdoc
	 */
	documentation(options) {
		return super.documentation(options, async () => {
			// API and text documentation for all subpackages
			await this.forEachSubpackage(async ({ root, name }) => {
				await documenter.generateAPI({
					root,
					source: `${root}/${paths.subpackage.sources}`,
					destination: `${paths.package.documentation}/${name}`,
					depth: 2,
				});

				await documenter.generateText({
					source: `${root}/${paths.subpackage.sources}`,
					destination: `${paths.package.documentation}/${name}`,
				});
			});
		});
	}

	/**
	 * @inheritdoc
	 */
	prepare(options) {
		return super.prepare(options, async () => {
			// Copy root license to all subpackages
			this.forEachSubpackage(({ root }) => {
				const LICENSE = `${root}/LICENSE`;
				terminal.print(`Update license in ${chalk.underline(this.relativizePath(LICENSE))}`).spacer();
				fss.copy(`${paths.package.root}/LICENSE`, LICENSE);
			});

			// Update version for all subpackages
			terminal.process.run(`
				${[
					`${this.lernaBinary} version ${this.version}`,
					"--force-publish", // Update all subpackages
					"--exact", // Update to the exact version (no range)
					"--no-git-tag-version", // Don't git tag
					"--no-push", // Don't git push
					"--yes", // No confirmation prompts
				].join(" ")}
				${[
					`npm version ${this.version}`,
					"--workspaces", // Update all subpackages
					"--include-workspace-root", // Update root package.json
					"--workspaces-update", // Run an update
					"--no-git-tag-version", // Don't git tag
					"--allow-same-version", // Allow version rewrite
				].join(" ")}
			`);
		});
	}
}

export default MultiManager;
