//--------------------------------------------------------
//-- Multi
//--------------------------------------------------------
import minimist     from 'minimist';
import fss          from '@absolunet/fss';
import { terminal } from '@absolunet/terminal';
import paths        from './helpers/paths';
import util         from './helpers/util';

let subPackagesList = [];






/**
 * Multi-package manager.
 *
 * @hideconstructor
 */
class Multi {

	/**
	 * Current multi-package version.
	 *
	 * @type {string}
	 */
	get version() {
		const FILE = `${paths.package.root}/lerna.json`;

		if (fss.exists(FILE)) {
			const { version } = fss.readJson(FILE);

			return version;
		}

		return undefined;
	}


	/**
	 * List of subpackages root directory.
	 *
	 * @type {Array<string>}
	 */
	get topologicalPackagesPaths() {
		if (subPackagesList.length === 0) {
			const rawList = terminal.runAndRead('lerna exec --concurrency=1 --loglevel=silent -- pwd');
			const list    = rawList.replace(/^(?<header>info cli.+\n)(?<path>[\s\S]+)/u, '$<path>').split('\n');

			subPackagesList = list
				.filter((item) => { return Boolean(item); })
				.map((item) => { return util.relativizePath(item); });
		}

		return subPackagesList;
	}






	/**
	 * Post-install task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @returns {Promise} When task completed.
	 */
	async postinstall({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Install dependencies');
		await util.preRunner(preRun);

		terminal.println('Install packages dependencies and link siblings');
		fss.removePattern(`${paths.package.root}/packages/*/package-lock.json`);
		terminal.run(`
			lerna clean --yes
			lerna bootstrap --no-ci
		`);

		await util.postRunner(postRun);
	}


	/**
	 * Outdated task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @returns {Promise} When task completed.
	 */
	async outdated({ preRun, postRun } = {}) {
		terminal.titleBox('Manager: Check for outdated dependencies');
		await util.preRunner(preRun);

		await util.npmOutdated();
		for (const path of this.topologicalPackagesPaths) {
			await util.npmOutdated(path);  // eslint-disable-line no-await-in-loop
		}

		await util.postRunner(postRun);
	}


	/**
	 * Build task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @param {DistributionOptions} [dist] - Distribution options.
	 * @returns {Promise} When task completed.
	 */
	async build({ preRun, postRun } = {}/* , dist */) {
		terminal.titleBox('Manager: Build project');
		await util.preRunner(preRun);

		for (const path of this.topologicalPackagesPaths) {
			util.updateLicense(path);
			util.updateNodeVersion(path);
		}

		terminal.run(`
			lerna version ${this.version} --force-publish=* --exact --no-git-tag-version --no-push --yes
		`);

		await util.postRunner(postRun);
	}


	/**
	 * Watch task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @param {DistributionOptions} [dist] - Distribution options.
	 * @returns {Promise} When task completed.
	 */
	async watch(/* { preRun, postRun } = {}, dist */) {
		//
	}


	/**
	 * Assemble task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @returns {Promise} When task completed.
	 */
	async assemble(/* { preRun, postRun } = {} */) {
		//
	}


	/**
	 * Deploy task.
	 *
	 * @async
	 * @param {TaskHooks} [hooks] - Custom hooks.
	 * @param {object} [options] - Options.
	 * @param {boolean} options.restricted - When publishing, tell the registry the package should be published restricted instead of public.
	 * @param {boolean} options.useOTP - When publishing, use the two-factor authentication if enabled.
	 * @returns {Promise} When task completed.
	 */
	async deploy({ preRun, postRun } = {}, { restricted, useOTP } = {}) {
		terminal.titleBox('Manager: Deploy package');
		await util.preRunner(preRun);

		const tarballs = [];
		for (const path of this.topologicalPackagesPaths) {
			const { tarball } = await util.npmPack(path);  // eslint-disable-line no-await-in-loop
			tarballs.push(tarball);
		}

		const tag = util.getTag(this.version);
		const otp = await util.getOTP(useOTP);

		for (const tarball of tarballs) {
			await util.npmPublish({ tarball, tag, restricted, otp });  // eslint-disable-line no-await-in-loop
		}

		await util.postRunner(postRun);
	}






	/**
	 * Bootstrapper.
	 *
	 * @async
	 * @param {ManagerOptions} [options] - Options to customize the runner.
	 * @returns {Promise} When task completed.
	 */
	async scriptsRunner({ tasks = {}, restricted = false, useOTP = true } = {}) {
		const { task } = minimist(process.argv.slice(2));

		//-- Tasks
		switch (task) {

			case 'postinstall':
				await this.postinstall(tasks.postinstall);
				break;

			case 'outdated':
				await this.outdated(tasks.outdated);
				break;

			case 'build':
				await this.build(tasks.build);
				break;

			case 'deploy':
				await this.deploy(tasks.deploy, { restricted, useOTP });
				break;

			default:
				throw new Error('Task not defined');

		}

		terminal.completionBox('Completed');
	}

}


export default new Multi();
