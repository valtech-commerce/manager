//--------------------------------------------------------
//-- Helper
//--------------------------------------------------------
'use strict';

const figures      = require('figures');
const inquirer     = require('inquirer');
const kebabcase    = require('lodash.kebabcase');
const npmCheck     = require('npm-check');
const path         = require('path');
const semver       = require('semver');
const stringLength = require('string-length');
const textTable    = require('text-table');
const tmp          = require('tmp');
const fsp          = require('@absolunet/fsp');
const fss          = require('@absolunet/fss');
const { terminal } = require('@absolunet/terminal');
const { chalk }    = terminal;


const getTemporaryDirectory = (id = 'tmp') => {
	tmp.setGracefulCleanup();

	return new Promise((resolve) => {
		tmp.dir({ prefix: `absolunetmanager-${id}-`, unsafeCleanup: true }, (error, temporaryPath) => {
			if (error) {
				terminal.error(error);
				terminal.exit();
			}

			resolve(temporaryPath);
		});
	});
};





/**
 * Manager helpers.
 *
 * @hideconstructor
 */
class Helper {

	/**
	 * Pre-runner wrapper.
	 *
	 * @async
	 * @param {Function} runner - Custom pre-run hook.
	 * @returns {Promise} When pre-runner completed.
	 */
	async preRunner(runner) {
		if (runner) {
			terminal.infoBox('Custom pre-runner');
			await runner({ terminal });
			terminal.infoBox('Manager runner');
		} else {
			terminal.echo(`${figures.pointer} No custom pre-runner\n\n`);
		}
	}


	/**
	 * Post-runner wrapper.
	 *
	 * @async
	 * @param {Function} runner - Custom post-run hook.
	 * @returns {Promise} When post-runner completed.
	 */
	async postRunner(runner) {
		if (runner) {
			terminal.infoBox('Custom post-runner');
			await runner({ terminal });
		} else {
			terminal.echo(`\n${figures.pointer} No custom post-runner`);
		}
	}




	/**
	 * Update Node.js engine version in package.json.
	 *
	 * @param {string} [root='.'] - Directory path of the package.json.
	 */
	updateNodeVersion(root = '.') {
		const FILE = `${root}/package.json`;
		terminal.println(`Update Node version in ${chalk.underline(FILE)}`);

		const data = fss.readJson(FILE);
		data.engines.node = `>= ${process.versions.node}`;
		fss.writeJson(FILE, data, { space: 2 });
	}


	/**
	 * Copy license file from project root to sub-package root.
	 *
	 * @param {string} [root='.'] - Directory path of the sub-package licence.
	 */
	updateLicense(root = '.') {
		const LICENSE = `${root}/license`;
		terminal.println(`Update license in ${chalk.underline(LICENSE)}`);
		fss.copy('./license', LICENSE);
	}




	/**
	 * Check for outdated packages.
	 *
	 * @async
	 * @param {string} [root='.'] - Directory path of the package.json.
	 * @param {boolean} [verbose=false] - Verbose mode.
	 * @returns {Promise} When method completed.
	 */
	async npmOutdated(root = '.', verbose = false) {
		terminal.println(`Checking ${chalk.underline(`${root}/package.json`)} for outdated dependencies`);

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
			terminal.echoIndent(textTable(results, {
				align: ['l', 'r', 'r', 'r'],
				stringLength: (text) => { return stringLength(text); }
			}));
			terminal.spacer();
		} else {
			terminal.success(`All is good`);
		}

		terminal.spacer();
	}


	/**
	 * Install npm packages.
	 *
	 * @async
	 * @param {string} [root='.'] - Directory path of the package.json.
	 * @returns {Promise} When method completed.
	 */
	async npmInstall(root = '.') {
		terminal.println(`Install dependencies in ${chalk.underline(`${root}/`)}`);
		await fsp.remove(`${root}/node_modules`);
		await fsp.remove(`${root}/package-lock.json`);
		terminal.run(`cd ${root} && npm install --no-audit`);
		terminal.spacer();
	}


	/**
	 * Pack directory and return tarball path.
	 *
	 * @async
	 * @param {string} [root='.'] - Directory path of the package.json.
	 * @returns {Promise<object<{tarball: string, version: string}>>} Tarball path and version used.
	 */
	async npmPack(root = '.') {
		terminal.println(`Pack package in ${chalk.underline(`${root}/`)}`);

		const directory = await getTemporaryDirectory('package-tarball');

		terminal.run(`
			cd ${directory}
			npm pack ${fss.realpath(root)}
		`);
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
		terminal.println(`Publish tarball ${chalk.underline(path.basename(tarball))}`);

		terminal.run(`
			npm publish ${tarball} --tag=${tag} --access=${restricted ? 'restricted' : 'public'} ${otp ? `--otp=${otp}` : ''}
		`);
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
			terminal.exit('Deployment cancelled');
		}

		terminal.spacer();

		return otp;
	}

}


module.exports = new Helper();
