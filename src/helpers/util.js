//--------------------------------------------------------
//-- Util
//--------------------------------------------------------
import fsp from "@absolunet/fsp";
import { terminal } from "@absolunet/terminal";
import chalk from "chalk";
import figures from "figures";
import minimist from "minimist";
import npmCheck from "npm-check";
import semver from "semver";
import stringLength from "string-length";
import textTable from "text-table";
import environment from "./environment.js";
import paths from "./paths.js";

/**
 * Manager utils.
 *
 * @hideconstructor
 */
class Util {
	/**
	 * Relativize path from package root.
	 *
	 * @param {string} absolutePath - Absolute package path.
	 * @returns {string} Relativized path.
	 */
	relativizePath(absolutePath) {
		return absolutePath.replace(paths.package.root, ".");
	}

	/**
	 * Fetch task from CLI.
	 *
	 * @returns {string} Task fetched from terminal.
	 */
	getTask() {
		return minimist(process.argv.slice(2)).task;
	}

	/**
	 * Fetch release from CLI.
	 *
	 * @returns {string} Release fetched from terminal.
	 */
	getRelease() {
		return minimist(process.argv.slice(2)).release;
	}

	/**
	 * Task runner.
	 *
	 * @async
	 * @param {object} options - Options.
	 * @param {Task} options.task - Task.
	 * @param {TaskHooks} [options.hooks] - Custom hooks.
	 * @param {boolean} [options.grouped=false] - Options.
	 * @param {Function} main - Main runner.
	 * @returns {Promise} When post-runner completed.
	 */
	async taskRunner({ task, hooks = {}, grouped = false }, main) {
		const { name, banner } = environment.TASK_DATA[task];

		// Banner
		if (grouped) {
			terminal.infoBox(`${name}: ${banner}`);
		} else {
			terminal.titleBox(`Manager: ${banner}`);
		}

		// Pre-runner
		if (hooks.preRun) {
			terminal.infoBox(`${name}: Custom pre-runner`);
			await hooks.preRun({ terminal });
			terminal.infoBox(`${name}: Generic runner`);
		} else {
			terminal.echo(`${figures.pointer} ${name}: No custom pre-runner`).spacer(2);
		}

		// Generic runner
		await main();

		// Post-runner
		if (hooks.postRun) {
			terminal.infoBox(`${name}: Custom post-runner`);
			await hooks.postRun({ terminal });
		} else {
			terminal.spacer().echo(`${figures.pointer} ${name}: No custom post-runner`);
		}

		// Completion banner
		if (grouped) {
			terminal.infoBox(`${name}: ${figures.tick} Completed`);
		}
	}

	/**
	 * Update LICENSE file to current year.
	 */
	async updateLicense() {
		terminal.print("Update year in LICENSE").spacer();
		const licenseFile = `${paths.package.root}/LICENSE`;
		let licenseData = await fsp.readFile(licenseFile, "utf8");
		licenseData = licenseData.replace(
			/Copyright \(c\) (?<start>\d{4})-\d{4}/u,
			`Copyright (c) $<start>-${new Date().getFullYear()}`
		);
		await fsp.writeFile(licenseFile, licenseData);
	}

	/**
	 * Increment version.
	 *
	 * @param {string} version - Version to increment.
	 * @returns {string} Incremented.
	 */
	incrementVersion(version) {
		const release = this.getRelease();

		if (!/^(major|minor|patch)$/.test(release)) {
			return null;
		}

		return semver.inc(version, release);
	}

	/**
	 * Check for outdated packages.
	 *
	 * @async
	 * @param {string} [root={@link PackagePaths}.root] - Directory path of the package.json.
	 * @param {boolean} [verbose=false] - Verbose mode.
	 * @returns {Promise} When method completed.
	 */
	async npmOutdated(root = paths.package.root, verbose = false) {
		terminal
			.print(`Checking ${chalk.underline(this.relativizePath(`${root}/package.json`))} for outdated dependencies`)
			.spacer();

		// Dependencies
		const currentState = await npmCheck({ cwd: root });

		const results = [];
		for (const {
			moduleName: name,
			isInstalled,
			packageJson: wantedRaw,
			installed,
			latest: latestRaw,
		} of currentState.get("packages")) {
			const latest = latestRaw === undefined || latestRaw === null ? "NOT FOUND" : latestRaw;

			if (wantedRaw) {
				const wanted = semver.coerce(wantedRaw).version;

				if (isInstalled) {
					if (semver.coerce(latest) && semver.lte(installed, latest) && semver.lte(wanted, latest)) {
						if (installed === latest && wanted === latest) {
							// All is good
							if (verbose) {
								results.push([name, chalk.green(installed), chalk.green(wantedRaw), chalk.green(latest)]);
							}

							// Mismatch between versions
						} else {
							results.push([
								chalk.yellow(name),
								installed === latest ? installed : chalk.yellow(installed),
								wanted === latest ? wantedRaw : chalk.red(wantedRaw),
								chalk.magenta(latest),
							]);
						}

						// Current or wanted greater than latest (wut?)
					} else {
						results.push([chalk.red(name), chalk.red(installed), chalk.red(wantedRaw), chalk.red(latest)]);
					}

					// Not installed
				} else {
					results.push([chalk.red(name), chalk.red("NOT INSTALLED"), chalk.red(wantedRaw), chalk.red(latest)]);
				}
			}
		}

		if (results.length > 0) {
			results.unshift([
				chalk.underline("Package"),
				` ${chalk.underline("Current")}`,
				` ${chalk.underline("Wanted")}`,
				` ${chalk.underline("Latest")}`,
			]);
			terminal
				.echoIndent(
					textTable(results, {
						align: ["l", "r", "r", "r"],
						stringLength: (text) => {
							return stringLength(text);
						},
					})
				)
				.spacer();
		} else {
			terminal.success(`All is good`);
		}

		terminal.spacer();
	}
}

export default new Util();
