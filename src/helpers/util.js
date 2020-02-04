//--------------------------------------------------------
//-- Util
//--------------------------------------------------------
import chalk        from 'chalk';
import figures      from 'figures';
import inquirer     from 'inquirer';
import kebabcase    from 'lodash.kebabcase';
import minimist     from 'minimist';
import npmCheck     from 'npm-check';
import path         from 'path';
import semver       from 'semver';
import stringLength from 'string-length';
import textTable    from 'text-table';
import tmp          from 'tmp';
import fsp          from '@absolunet/fsp';
import fss          from '@absolunet/fss';
import { terminal } from '@absolunet/terminal';
import env          from './environment';
import paths        from './paths';


const getTemporaryDirectory = (id = 'tmp') => {
	tmp.setGracefulCleanup();

	return new Promise((resolve) => {
		tmp.dir({ prefix: `absolunetmanager-${id}-`, unsafeCleanup: true }, (error, temporaryPath) => {
			if (error) {
				terminal.error(error).exit();
			}

			resolve(temporaryPath);
		});
	});
};





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
		return absolutePath.replace(paths.package.root, '.');
	}


	/**
	 * Post-runner wrapper.
	 *
	 * @returns {string} Task fetch from terminal.
	 */
	getTask() {
		return minimist(process.argv.slice(2)).task;
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
		const { name, banner } = env.TASK_DATA[task];

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
	 * Copy license file from project root to sub-package root.
	 *
	 * @param {string} [root={@link PackagePaths}.root] - Directory path of the sub-package licence.
	 */
	updateLicense(root = paths.package.root) {
		const LICENSE = `${root}/license`;
		terminal.print(`Update license in ${chalk.underline(this.relativizePath(LICENSE))}`).spacer();
		fss.copy(`${paths.package.root}/license`, LICENSE);
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
		terminal.print(`Checking ${chalk.underline(this.relativizePath(`${root}/package.json`))} for outdated dependencies`).spacer();

		// Dependencies
		const currentState = await npmCheck({ cwd: root });

		const results = [];
		for (const { moduleName: name, isInstalled, packageJson: wantedRaw, installed, latest: latestRaw } of currentState.get('packages')) {
			const latest = latestRaw === undefined || latestRaw === null ? 'NOT FOUND' : latestRaw;

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
								chalk.magenta(latest)
							]);
						}

					// Current or wanted greater than latest (wut?)
					} else {
						results.push([chalk.red(name), chalk.red(installed), chalk.red(wantedRaw), chalk.red(latest)]);
					}

				// Not installed
				} else {
					results.push([chalk.red(name), chalk.red('NOT INSTALLED'), chalk.red(wantedRaw), chalk.red(latest)]);
				}
			}
		}

		if (results.length !== 0) {
			results.unshift([chalk.underline('Package'), ` ${chalk.underline('Current')}`, ` ${chalk.underline('Wanted')}`, ` ${chalk.underline('Latest')}`]);
			terminal
				.echoIndent(textTable(results, {
					align: ['l', 'r', 'r', 'r'],
					stringLength: (text) => { return stringLength(text); }
				}))
				.spacer()
			;
		} else {
			terminal.success(`All is good`);
		}

		terminal.spacer();
	}


	/**
	 * Install npm packages.
	 *
	 * @async
	 * @param {string} [root={@link PackagePaths}.root] - Directory path of the package.json.
	 * @returns {Promise} When method completed.
	 */
	async npmInstall(root = paths.package.root) {
		terminal.print(`Install dependencies in ${chalk.underline(this.relativizePath(root))}`).spacer();
		await fsp.remove(`${root}/node_modules`);
		await fsp.remove(`${root}/package-lock.json`);
		terminal.process.run(`npm install --no-audit`, { directory: root });
		terminal.spacer();
	}


	/**
	 * Pack directory and return tarball path.
	 *
	 * @async
	 * @param {string} [root={@link PackagePaths}.root] - Directory path of the package.json.
	 * @returns {Promise<object<{tarball: string, version: string}>>} Tarball path and version used.
	 */
	async npmPack(root = paths.package.root) {
		terminal.print(`Pack package in ${chalk.underline(this.relativizePath(root))}`).spacer();

		const directory = await getTemporaryDirectory('package-tarball');

		terminal.process.run(`npm pack ${fss.realpath(root)}`, { directory });
		terminal.spacer();

		const { name, version } = fss.readJson(`${root}/package.json`);
		const tarball = `${directory}/${kebabcase(name)}-${version}.tgz`;

		if (fss.exists(tarball)) {
			return { tarball, version };
		}

		throw new Error(`Tarball name mismatch '${tarball}'`);
	}


	/**
	 * Publish package.
	 *
	 * @async
	 * @param {object} parameters - Parameters.
	 * @param {string} parameters.tarball - Tarball path.
	 * @param {string} parameters.tag - Tag to use.
	 * @param {boolean} parameters.restricted - Tell the registry the package should be published restricted instead of public.
	 * @param {boolean} parameters.otp - Use the two-factor authentication if enabled.
	 * @returns {Promise} When method completed.
	 */
	async npmPublish({ tarball, tag, restricted, otp }) {  	// eslint-disable-line require-await
		terminal.print(`Publish tarball ${chalk.underline(path.basename(tarball))}`).spacer();
		terminal.process.run(`npm publish ${tarball} --tag=${tag} --access=${restricted ? 'restricted' : 'public'} ${otp ? `--otp=${otp}` : ''}`);
		terminal.spacer();
	}




	/**
	 * Get publish tag depending on version.
	 *
	 * @param {string} version - Version to check.
	 * @returns {string} Tag.
	 */
	getTag(version) {
		return semver.prerelease(version) === null ? 'latest' : 'next';
	}


	/**
	 * Ask user for npm's one-time password or confirm publication.
	 *
	 * @async
	 * @param {boolean} useOTP - Get one-time password or confirm publication.
	 * @returns {Promise<string|undefined>} User's one-time password.
	 */
	async getOTP(useOTP) {
		const { otp, confirm } = await inquirer.prompt([
			{
				name:     'otp',
				message:  `Please write your npm OTP:`,
				type:     'input',
				when:     () => { return useOTP; },
				validate: (value) => {
					return (/^\d{6}$/u).test(value) ? true : `Your OTP isn't valid`;
				}
			},
			{
				name:     'confirm',
				message:  `Are you sure you want to publish?`,
				type:     'confirm',
				when:     () => { return !useOTP; }
			}
		]);

		if (!(otp || confirm)) {
			terminal.exit('Publication cancelled');
		}

		terminal.spacer();

		return otp;
	}


	/**
	 * Ask user for consent for unsafe publishing.
	 *
	 * @async
	 * @returns {Promise} Completes if user consents.
	 */
	async confirmUnsafePublish() {
		const { confirm } = await inquirer.prompt([{
			name:     'confirm',
			message:  `Are you sure you want to publish without any safeguards?`,
			type:     'confirm'
		}]);

		if (!confirm) {
			terminal.exit('Publication cancelled');
		}

		terminal.spacer();
	}

}


export default new Util();
